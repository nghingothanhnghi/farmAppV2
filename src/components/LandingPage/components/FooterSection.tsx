const FooterSection = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-zinc-200 bg-white py-5 dark:border-white/10 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl px-6">
        {/* Add links or branding here if needed */}
        <p className="text-center text-xs text-zinc-500">
          © {year} HydroFarm. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default FooterSection;
