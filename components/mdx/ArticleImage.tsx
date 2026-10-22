"use client";

import { useEffect, useRef, useState, type ComponentPropsWithoutRef } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";

type ArticleImageProps = ComponentPropsWithoutRef<"img">;

export function ArticleImage({ alt = "", src, ...props }: ArticleImageProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const closePreview = () => {
    dialogRef.current?.close();
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!isOpen) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();

    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!src) return null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={`放大图片：${alt || "文章图片"}`}
        className="inline-block max-w-full cursor-zoom-in rounded-lg text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
        onClick={() => setIsOpen(true)}
      >
        {/* The article image keeps the intrinsic size supplied by MDX. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} {...props} />
      </button>

      {isOpen &&
        createPortal(
          <dialog
            ref={dialogRef}
            aria-label={`图片预览：${alt || "文章图片"}`}
            className="fixed inset-0 m-auto h-dvh w-screen max-h-none max-w-none border-0 bg-transparent p-4 text-white backdrop:bg-black/85"
            onCancel={(event) => {
              event.preventDefault();
              closePreview();
            }}
            onClick={(event) => {
              if (event.target === event.currentTarget) closePreview();
            }}
          >
            <button
              type="button"
              aria-label="关闭图片预览"
              className="fixed right-4 top-4 z-10 rounded-full bg-black/60 p-2 text-white cursor-pointer hover:bg-black/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              onClick={closePreview}
            >
              <FiX size={22} />
            </button>
            <div className="flex h-full w-full items-center justify-center pointer-events-none">
              {/* The preview uses the original image URL. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={alt}
                className="max-h-full max-w-full object-contain pointer-events-auto"
              />
            </div>
          </dialog>,
          document.body
        )}
    </>
  );
}
