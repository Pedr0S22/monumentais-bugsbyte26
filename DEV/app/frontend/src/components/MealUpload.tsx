import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { uploadMealPhoto } from "../api/client";
import type { MealPhotoAnalysis } from "../api/types";

function buildMacrosPreview(macros?: Record<string, number>) {
  if (!macros) return null;
  return (
    <div className="flex flex-wrap gap-2 text-xs text-white/80">
      {Object.entries(macros).map(([key, value]) => (
        <span key={key} className="bg-white/5 px-2 py-1 rounded-full border border-white/10">
          {key}: {value.toFixed(1)}
        </span>
      ))}
    </div>
  );
}

export function MealUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const mutation = useMutation<MealPhotoAnalysis, Error, File>({
    mutationFn: (image) => uploadMealPhoto(image),
  });

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.target.files?.[0];
    if (!next) return;
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setFile(next);
    setPreview(URL.createObjectURL(next));
    mutation.reset();
  };

  const triggerCamera = () => cameraInputRef.current?.click();
  const triggerGallery = () => galleryInputRef.current?.click();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) return;
    mutation.mutate(file);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Log by photo</h3>
        {mutation.isPending && <span className="text-xs text-white/60">Analyzing…</span>}
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <p className="text-sm text-white/80 mb-2">Add food from your gallery or take a new photo</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={triggerCamera}
              className="inline-flex justify-center items-center gap-2 px-4 py-2 rounded-lg border border-white/10 bg-white/5 w-full text-sm font-medium text-white hover:border-white/40"
            >
              📷 Tirar foto
            </button>
            <button
              type="button"
              onClick={triggerGallery}
              className="inline-flex justify-center items-center gap-2 px-4 py-2 rounded-lg border border-white/10 bg-white/5 w-full text-sm font-medium text-white hover:border-white/40"
            >
              🖼️ Galeria
            </button>
          </div>
        </div>
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleChange}
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleChange}
        />

        {preview && (
          <div className="rounded-lg overflow-hidden border border-white/10">
            <img src={preview} alt="meal preview" className="w-full h-48 object-cover" />
          </div>
        )}

        <button
          type="submit"
          disabled={!file || mutation.isPending}
          className="w-full py-2 px-4 rounded-lg bg-lettyGreen text-slate-900 font-semibold hover:brightness-110 disabled:opacity-60"
        >
          {mutation.isPending ? "Letty is thinking…" : "Send to Letty"}
        </button>
      </form>

      {mutation.isSuccess && (
        <div className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-2">
          <p className="text-sm text-white/90">Score: {mutation.data.score}</p>
          <p className="text-sm text-white/80">Meal quality: {mutation.data.meal_quality}</p>
          <p className="text-sm text-white/70">{mutation.data.message}</p>
          {buildMacrosPreview(mutation.data.macros)}
        </div>
      )}

      {mutation.isError && (
        <div className="text-sm text-lettyRed">{mutation.error?.message || "Unable to analyze photo."}</div>
      )}
    </div>
  );
}