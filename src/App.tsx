import { useState, useEffect, useRef } from 'react';
import { 
  useConnect, 
  useAccount, 
  useReadContract, 
  useDisconnect,
  useWriteContract
} from 'wagmi';
import { vendingMachineAddress, vendingMachineAbi } from './contract.ts';
import { parseEther } from 'viem';

// --- Komponen Popup ---
function ComingSoonPopup({ message, onClose }: { message: string; onClose: () => void; }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in">
      <div className="bg-gray-900 border-2 border-cyan-400 p-8 rounded-lg shadow-lg shadow-cyan-500/50 text-center relative max-w-sm mx-4">
        <button 
          onClick={onClose} 
          className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
        <p className="text-2xl font-bold text-yellow-400 tracking-widest">{message}</p>
      </div>
    </div>
  );
}

// --- Komponen Dropdown Wallet ---
function WalletDropdown() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const [isOpen, setIsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleCopy = () => {
    if (address) {
      const textArea = document.createElement("textarea");
      textArea.value = address;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000); 
      } catch (err) {
        console.error('Failed to copy address: ', err);
      }
      document.body.removeChild(textArea);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);


  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex items-center gap-2 bg-gray-700/50 hover:bg-gray-700 border border-cyan-500/30 px-3 py-2 rounded-lg transition-colors"
      >
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        <span>{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '...'}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-60 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 animate-fade-in-fast p-2">
          <div className="px-3 py-2">
            <div className="text-xs text-gray-400">Connected</div>
            <div className="font-mono text-white break-all">{address}</div>
          </div>
          <button 
            onClick={handleCopy}
            className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded"
          >
            {isCopied ? 'Copied!' : 'Copy Address'}
          </button>
          <hr className="border-gray-700 my-1"/>
          <button 
            onClick={() => disconnect()} 
            className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-gray-700 rounded"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}


// --- Tipe Data untuk Props ---
type PageProps = {
  onNavigate: (page: string) => void;
};

type HomePageProps = PageProps & {
  ownerAddress: `0x${string}` | undefined;
  currentUserAddress: `0x${string}` | undefined;
};

// --- Komponen Halaman Utama ---
function HomePage({ onNavigate, ownerAddress, currentUserAddress }: HomePageProps) {
  const { writeContract, isPending: isWriteLoading, data: hash, isSuccess: isBeliSuccess } = useWriteContract();
  const { data: harga, isLoading: isHargaLoading } = useReadContract({
    address: vendingMachineAddress,
    abi: vendingMachineAbi,
    functionName: 'hargaProduk',
  });

  function handleContribute() {
    writeContract({
      address: vendingMachineAddress,
      abi: vendingMachineAbi,
      functionName: 'beliProduk',
      value: parseEther('0.5'), 
    });
  }

  return (
    <div className="text-center p-4 flex flex-col items-center gap-6 animate-fade-in">
      <div className="bg-gray-800/50 border border-purple-500/30 rounded-lg p-4 w-full">
        <p className="text-xl text-gray-300">
          Contribution Amount:
        </p>
        <p className="font-bold text-4xl text-yellow-400 my-2">
          {isHargaLoading ? '...' : (typeof harga === 'bigint' ? `${Number(harga) / 1e18} MON` : 'N/A')}
        </p>
      </div>
      
      <button 
        onClick={handleContribute} 
        disabled={isWriteLoading}
        className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 px-6 rounded-lg text-lg shadow-lg shadow-cyan-500/50 transition-all duration-300 disabled:bg-gray-600 disabled:shadow-none disabled:cursor-not-allowed"
      >
        {isWriteLoading ? 'Processing...' : 'CONTRIBUTE (0.5 MON)'}
      </button>

      {isBeliSuccess && (
        <div className="text-green-400 mt-2">
          Contribution successful! Tx: <a href={`https://testnet.monadexplorer.com/tx/${hash}`} target="_blank" rel="noopener noreferrer" className="underline">{hash?.slice(0, 10)}...</a>
        </div>
      )}

      {currentUserAddress === ownerAddress && (
        <button 
          onClick={() => onNavigate('admin')}
          className="text-purple-400 hover:text-white mt-2"
        >
          Go to Admin Panel
        </button>
      )}
    </div>
  );
}

// --- Komponen Halaman Admin ---
function AdminPage({ onNavigate }: PageProps) {
  const { writeContract, isPending: isWriteLoading, data: hash, isSuccess } = useWriteContract();
  
  function handleWithdraw() {
    writeContract({
      address: vendingMachineAddress,
      abi: vendingMachineAbi,
      functionName: 'tarikDana',
    });
  }

  return (
    <div className="border border-red-500/50 p-6 rounded-xl shadow-lg shadow-red-500/20 text-center animate-fade-in">
        <h3 className="text-2xl font-bold text-red-400 mb-2">-- ADMIN CONTROL PANEL --</h3>
        <p className="text-gray-300 mb-4">Welcome, Owner.</p>
        <button 
            onClick={handleWithdraw} 
            disabled={isWriteLoading}
            className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-red-500/50 transition-all duration-300 disabled:bg-gray-600"
        >
            {isWriteLoading ? 'Processing...' : 'WITHDRAW ALL FUNDS'}
        </button>
        {isSuccess && (
          <div className="text-green-400 mt-2">
            Withdrawal successful! Tx: <a href={`https://testnet.monadexplorer.com/tx/${hash}`} target="_blank" rel="noopener noreferrer" className="underline">{hash?.slice(0, 10)}...</a>
          </div>
        )}
        <button onClick={() => onNavigate('home')} className="mt-4 text-gray-400 hover:text-white w-full">
          Back to Home
        </button>
    </div>
  )
}

// --- Komponen Halaman Roadmap ---
function RoadmapPage({ onNavigate }: PageProps) {
  const roadMapItems = [
    { q: 'Q2 2025', title: 'Initial Contribution to Nostro', status: 'Completed' },
    { q: 'Q2 2025', title: 'Nostro Acquires Funds', status: 'Completed' },
    { q: 'Q2 - Monad Mainnet', title: 'Nostro Develops More DApps on Monad', status: 'In Progress' },
    { q: 'Updated Soon', title: 'Monad Thrives with Nostro\'s Help', status: 'To Do' },
  ];

  return (
    <div className="p-4 text-center animate-fade-in">
      <h2 className="text-3xl font-bold mb-6 text-yellow-400">ROADMAP TO VICTORY</h2>
      <div className="space-y-4 text-left">
        {roadMapItems.map((item, index) => (
          <div key={item.title} className="bg-gray-800/50 p-4 rounded-lg border border-purple-500/30 flex items-center gap-4 hover:border-purple-400 transition-colors">
            <div className="text-2xl font-bold text-purple-400">{index + 1}</div>
            <div>
              <p className="font-mono text-sm text-gray-400">{item.q}</p>
              <p className="text-xl font-bold">{item.title}</p>
              <p className="text-sm text-cyan-400">{item.status}</p>
            </div>
          </div>
        ))}
      </div>
       <button onClick={() => onNavigate('home')} className="mt-6 text-gray-400 hover:text-white">
          Back
        </button>
    </div>
  );
}

// --- Komponen Footer ---
function Footer() {
  const [popupMessage, setPopupMessage] = useState<string | null>(null);

  return (
    <>
      <footer className="w-full p-4 mt-8 flex justify-center items-center space-x-6">
          <a href="https://twitter.com/nostrodetion" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-cyan-400 transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
          </a>
          <button onClick={() => setPopupMessage('LinkedIn | COMING SOON')} className="text-gray-400 hover:text-cyan-400 transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
          </button>
          <button onClick={() => setPopupMessage('Portfolio | UNDER CONSTRUCTION')} className="text-gray-400 hover:text-cyan-400 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"></path></svg>
          </button>
      </footer>
      {popupMessage && <ComingSoonPopup message={popupMessage} onClose={() => setPopupMessage(null)} />}
    </>
  )
}


// --- Komponen Utama Aplikasi ---
function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const { connectors, connect } = useConnect();
  const { address, isConnected } = useAccount();

  // ▼▼▼ PERUBAHAN #1: Siapkan 'remote control' & state musik ▼▼▼
  const audioRef = useRef<HTMLAudioElement>(null);
  const [musicStarted, setMusicStarted] = useState(false);

  const { data: ownerAddress } = useReadContract({
    address: vendingMachineAddress,
    abi: vendingMachineAbi,
    functionName: 'owner',
  });

  useEffect(() => {
    if (!isConnected) {
      setCurrentPage('home');
    }
  }, [isConnected]);

  const navigate = (page: string) => setCurrentPage(page);

  // ▼▼▼ PERUBAHAN #2: Fungsi untuk memulai musik ▼▼▼
  const startMusic = () => {
    if (audioRef.current && !musicStarted) {
      audioRef.current.volume = 0.3; // Atur volume biar gak terlalu kencang
      audioRef.current.play().catch(e => console.error("Autoplay failed:", e));
      setMusicStarted(true);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'admin':
        return <AdminPage onNavigate={navigate} />;
      case 'roadmap':
        return <RoadmapPage onNavigate={navigate} />;
      case 'home':
      default:
        return <HomePage onNavigate={navigate} ownerAddress={ownerAddress as `0x${string}` | undefined} currentUserAddress={address} />;
    }
  }

  const ConnectView = () => (
    <div className="text-center p-4 animate-fade-in">
      <h2 className="text-2xl font-bold text-red-500 animate-pulse mb-4">CONNECT WALLET TO PROCEED</h2>
      {connectors.map((connector) => (
        <button
          key={connector.uid}
          // ▼▼▼ PERUBAHAN #3: Panggil startMusic() saat tombol connect di klik ▼▼▼
          onClick={() => {
            startMusic();
            connect({ connector });
          }}
          type="button"
          className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-purple-500/50 transition-all duration-300 mb-2"
        >
          Connect {connector.name}
        </button>
      ))}
    </div>
  );

  return (
    <div className="text-white min-h-screen flex flex-col items-center justify-center p-4 font-sans">
      {/* ▼▼▼ PERUBAHAN #4: Taruh audio player tersembunyi di sini ▼▼▼ */}
      <audio ref={audioRef} src="/theme.mp3" loop preload="auto" />

      {/* Efek Background */}
      <div 
        style={{ backgroundImage: `url('/background.png')` }}
        className="fixed inset-0 z-[-1] bg-cover bg-center bg-no-repeat"
      />
      <div className="fixed inset-0 z-[-1] bg-black/70 backdrop-blur-sm" />
      
      <div className="w-full max-w-2xl">
        <header className="relative z-10 w-full text-center backdrop-blur-sm bg-black/20 p-4 rounded-xl mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-cyan-400 tracking-widest uppercase">Nostro's Initiative</h1>
            <p className="text-xs text-gray-400">A Contribution DApp on Monad</p>
          </div>
          <nav className="flex items-center gap-6">
            <button onClick={() => navigate('home')} className="text-purple-400 hover:text-white font-bold">HOME</button>
            <button onClick={() => navigate('roadmap')} className="text-purple-400 hover:text-white font-bold">ROADMAP</button>
            {isConnected && <WalletDropdown />}
          </nav>
        </header>
        
        <main className="w-full bg-black/30 backdrop-blur-sm p-2 md:p-6 rounded-xl border border-cyan-500/20">
          {isConnected ? renderPage() : <ConnectView />}
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default App;
