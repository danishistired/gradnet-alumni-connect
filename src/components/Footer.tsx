export const Footer = () => {
  return (
    <footer className="bg-background relative isolate">
      <div className="mx-auto max-w-7xl overflow-hidden px-6 py-12 pb-20 sm:pb-12 lg:px-8">
        <p className="mt-4 flex items-center justify-center text-center text-xs leading-5 text-gray-500 dark:text-gray-400 gap-1">
          made with{" "}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-4 fill-red-400"
          >
            <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
          </svg>
          by danish. check out the{" "}
          <a
            target="_blank"
            href="https://github.com/danishistired/gradnet-alumni-connect"
            className="text-gray-600 dark:text-red-400 hover:underline"
          >
            source code
          </a>
        </p>
      </div>
    </footer>
  );
};
