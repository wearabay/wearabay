type Props = {
  role: string;
  storeName: string;
};

export default function AuthorCard({
  role,
  storeName,
}: Props) {
  return (
    <div
      className="
        mt-20
        rounded-[32px]
        border
        border-neutral-200
        bg-neutral-50
        p-10
      "
    >

      <p
        className="
          text-2xl
          font-light
          tracking-wide
        "
      >
        {storeName}
      </p>


      <p
        className="
          mt-2
          text-sm
          uppercase
          tracking-[0.18em]
          text-neutral-500
        "
      >
        {role}
      </p>


      <p
        className="
          mt-6
          max-w-2xl
          leading-8
          text-neutral-600
        "
      >
        {storeName} Editorial creates timeless stories about
        modest fashion, craftsmanship, premium fabrics, and
        everyday elegance for the modern Muslimah.
      </p>

    </div>
  );
}