import { ImageBulge } from "./ImageBulge";

export function ImageBulgeDemo() {
  return (
    <div>
      <ImageBulge
        src="/motion-lab/test-grid.svg"
        alt="Synthetic grid test texture (not stock photography — see MODUS_REDESIGN_REPORT.md)"
        className="h-[320px] w-full max-w-lg rounded-lg border border-line"
      />
      <p className="mt-3 max-w-md text-[12px] text-muted">
        A generated grid, not a stock photo — matches this project&apos;s existing
        discipline of never using fake photography (see FieldPhoto.tsx). Grid
        warping is also a clearer distortion test than a photo would be.
      </p>
    </div>
  );
}
