export function Footer() {
  return (
    <footer className="border-t border-border py-10 mb-10">
      <div className="max-w-container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img
              src="/assets/photon.svg"
              alt="Photon"
              className="w-8 h-8"
            />
            <div>
              <span className="font-mono font-medium text-text-primary">
                PHOTON
              </span>
              <p className="text-xs text-text-muted mt-1 max-w-md">
                An independent community resource for the Photon fee token of
                AtomOne. Not affiliated with All in Bits or AtomOne governance.
              </p>
            </div>
          </div>

          <div className="text-right text-xs text-text-muted space-y-1">
            <p>
              Chain data via{" "}
              <a href="https://nosnode.com" target="_blank">
                NosNode
              </a>
            </p>
            <p>
              Built by{" "}
              <a href="https://github.com/n0sn0de" target="_blank">
                n0sn0de
              </a>
            </p>
            <p>
              <a
                href="https://github.com/n0sn0de/photon-site"
                target="_blank"
              >
                Source on GitHub
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
