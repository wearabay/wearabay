import Link from "next/link";


type LogoProps = {
  dark?: boolean;
  storeName: string;
  tagline: string;
};


export default function Logo({
  dark = false,
  storeName,
  tagline,
}: LogoProps) {

  return (
    <Link
      href="/"
      className={`flex flex-col leading-none transition-colors duration-500 ${
        dark
          ? "text-neutral-900"
          : "text-white"
      }`}
    >

      <span className="text-2xl font-light tracking-[0.18em]">
        {storeName.toUpperCase()}
      </span>


      <span className="text-[11px] uppercase tracking-[0.65em]">
        {tagline}
      </span>

    </Link>
  );
}