"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { useId, useRef, useState, type ReactNode } from "react";
import { interiorProductPhoto } from "@/lib/interior-product-images";

type ImageItem = { src: string; alt: string };

function ImageDialog({ title, image, dialogRef, onClose, children }: {
  title: string;
  image?: ImageItem;
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  onClose: () => void;
  children?: ReactNode;
}) {
  const titleId = useId();
  return (
    <dialog ref={dialogRef} className="interior-dialog" aria-labelledby={titleId} onClose={onClose}>
      <div className="interior-dialog-head">
        <h2 id={titleId}>{title}</h2>
        <form method="dialog"><button className="interior-icon-button" aria-label="Close image preview" title="Close"><X size={21} /></button></form>
      </div>
      {image && <div className="interior-dialog-image"><Image src={image.src} alt={image.alt} fill sizes="(min-width: 960px) 890px, 95vw" /></div>}
      {children}
    </dialog>
  );
}

export function ImagePreview({ image, title, children }: { image: ImageItem; title: string; children: ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="interior-image-trigger" onClick={() => { dialog.current?.showModal(); setOpen(true); }} aria-label={`Enlarge ${title}`}>
        {children}
        <span className="interior-icon-button" aria-hidden="true"><Maximize2 size={17} /></span>
      </button>
      <ImageDialog title={title} dialogRef={dialog} image={open ? image : undefined} onClose={() => setOpen(false)} />
    </>
  );
}

export function ProductGallery({ images, title, model }: { images: ImageItem[]; title: string; model?: string }) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const current = images[index] || images[0];
  const openImage = () => { dialog.current?.showModal(); setOpen(true); };

  return (
    <div className="interior-product-gallery">
      <figure className={`interior-figure${index === 0 ? " interior-figure-primary" : ""}`}>
        <Image src={interiorProductPhoto(current.src)} alt={current.alt} fill priority={index === 0} sizes="(min-width: 1328px) 630px, (min-width: 701px) 49vw, calc(100vw - 32px)" />
        <button type="button" className="interior-icon-button" onClick={openImage} aria-label="Enlarge product image" title="Enlarge image"><Maximize2 size={19} /></button>
        {model && <figcaption>{model}</figcaption>}
      </figure>
      {images.length > 1 && (
        <div className="interior-thumbnails" aria-label="Product photos">
          {images.slice(0, 4).map((image, i) => (
            <button className="interior-thumb" type="button" key={image.src} onClick={() => setIndex(i)} aria-label={`Show product image ${i + 1}`} aria-pressed={index === i}>
              <Image src={interiorProductPhoto(image.src)} alt="" fill sizes="60px" />
            </button>
          ))}
          <button type="button" className="interior-thumb-count" onClick={openImage} aria-label={`View all ${images.length} product photos`}>{images.length} photos</button>
        </div>
      )}
      <ImageDialog title={title} dialogRef={dialog} image={open ? { ...current, src: interiorProductPhoto(current.src) } : undefined} onClose={() => setOpen(false)}>
        {open && images.length > 1 && (
          <div className="interior-gallery-controls">
            <button className="interior-icon-button" type="button" onClick={() => setIndex((i) => (i + images.length - 1) % images.length)} aria-label="Previous image" title="Previous image"><ChevronLeft size={21} /></button>
            <span aria-live="polite">{index + 1} / {images.length}</span>
            <button className="interior-icon-button" type="button" onClick={() => setIndex((i) => (i + 1) % images.length)} aria-label="Next image" title="Next image"><ChevronRight size={21} /></button>
          </div>
        )}
      </ImageDialog>
    </div>
  );
}
