type Props = {
  storeName: string;
};


export default function JournalHero({
  storeName,
}: Props) {

  return (

    <section className="border-b border-neutral-200 bg-white">

      <div
        className="
          mx-auto
          flex
          max-w-7xl
          flex-col
          items-center
          px-6
          py-24
          text-center
          md:py-28
        "
      >

        <span
          className="
            mb-5
            text-xs
            font-medium
            uppercase
            tracking-[0.35em]
            text-neutral-500
          "
        >
          {storeName} Journal
        </span>


        <h1
          className="
            max-w-4xl
            text-4xl
            font-semibold
            leading-tight
            tracking-tight
            text-black
            md:text-6xl
          "
        >
          Stories, Inspiration &
          <br />
          Timeless Modest Fashion
        </h1>


        <p
          className="
            mt-8
            max-w-2xl
            text-base
            leading-8
            text-neutral-600
            md:text-lg
          "
        >
          Discover styling advice, fabric care,
          behind-the-scenes stories, and inspiration
          curated by {storeName}.
        </p>

      </div>

    </section>

  );

}