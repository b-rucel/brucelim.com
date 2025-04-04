export default async function BlogIndexPage() {
  return (
    <div className="flex-grow grid-background flex flex-col gap-1 sm:min-h-[91vh] min-h-[88vh] pt-8">
      <div className="max-w-[960px] w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="my-7 flex flex-col gap-2">
          <h1 className="sm:text-3xl text-2xl font-extrabold">
            The latest blogs
          </h1>
          <p className="text-muted-foreground sm:text-[16.5px] text-[14.5px]">
            Explore my thoughts, experiences and learnings in software development, tech and etc
          </p>
        </div>
        <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 sm:gap-8 gap-4 mb-5">

        </div>
      </div>
    </div>
  );
}
