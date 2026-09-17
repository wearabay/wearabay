"use client";

import { Link2, Share2 } from "lucide-react";

type Props = {
  title: string;
  shareUrl: string;
};

export default function ShareButtons({
  title,
  shareUrl,
}: Props) {

  const encodedTitle =
    encodeURIComponent(title);

  const encodedUrl =
    encodeURIComponent(shareUrl);


  const copyLink = async () => {

    await navigator.clipboard.writeText(
      shareUrl
    );

  };


  return (

    <div
      className="
        mt-16
        border-t
        border-neutral-200
        pt-10
      "
    >

      <div
        className="
          flex
          items-center
          justify-between
        "
      >

        <span
          className="
            text-xs
            uppercase
            tracking-[0.25em]
            text-neutral-500
          "
        >
          Share Article
        </span>


        <div
          className="
            flex
            items-center
            gap-3
          "
        >

          <a
            href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="
              rounded-full
              border
              border-neutral-300
              p-3
              transition
              hover:bg-neutral-100
            "
            aria-label="Share on WhatsApp"
          >
            WA
          </a>


          <a
            href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="
              rounded-full
              border
              border-neutral-300
              p-3
              transition
              hover:bg-neutral-100
            "
            aria-label="Share on X"
          >
            X
          </a>


          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="
              rounded-full
              border
              border-neutral-300
              p-3
              transition
              hover:bg-neutral-100
            "
            aria-label="Share on Facebook"
          >
            <Share2 size={18} />
          </a>


          <button
            type="button"
            onClick={copyLink}
            className="
              rounded-full
              border
              border-neutral-300
              p-3
              transition
              hover:bg-neutral-100
            "
            aria-label="Copy Link"
          >
            <Link2 size={18} />
          </button>

        </div>

      </div>

    </div>

  );

}