import { useState, useEffect } from 'react';
import { 
  useConnect, 
  useAccount, 
  useReadContract, 
  useDisconnect,
  useWriteContract
} from 'wagmi';
import { vendingMachineAddress, vendingMachineAbi } from './contract.ts';
import { parseEther } from 'viem';

// --- Tipe Data untuk Props (KTP untuk Komponen) ---
type PageProps = {
  onNavigate: (page: string) => void;
};

type HomePageProps = PageProps & {
  ownerAddress: `0x${string}` | undefined;
  currentUserAddress: `0x${string}` | undefined;
};

// --- [BARU] Komponen Popup ---
function ComingSoonPopup({ message, onClose }: { message: string; onClose: () => void; }) {
  return (
    // Lapisan overlay gelap
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in">
      {/* Kotak popup */}
      <div className="bg-gray-900 border-2 border-cyan-400 p-8 rounded-lg shadow-lg shadow-cyan-500/50 text-center relative max-w-sm mx-4">
        {/* Tombol Close */}
        <button 
          onClick={onClose} 
          className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
        {/* Pesan Popup */}
        <p className="text-2xl font-bold text-yellow-400 tracking-widest">{message}</p>
      </div>
    </div>
  );
}


// --- Komponen Halaman Utama (Untuk Penyumbang) ---
function HomePage({ onNavigate, ownerAddress, currentUserAddress }: HomePageProps) {
  const { disconnect } = useDisconnect();
  const { writeContract, isPending: isWriteLoading, data: hash, isSuccess: isBeliSuccess } = useWriteContract();
  const { data: harga, isLoading: isHargaLoading } = useReadContract({
    address: vendingMachineAddress,
    abi: vendingMachineAbi,
    functionName: 'hargaProduk',
  });

  function handleBeliProduk() {
    writeContract({
      address: vendingMachineAddress,
      abi: vendingMachineAbi,
      functionName: 'beliProduk',
      value: parseEther('0.5'), 
    });
  }

  return (
    <div className="text-center p-4 flex flex-col items-center gap-4 animate-fade-in">
      <p className="text-lg text-gray-300">Connected to: <span className="font-mono text-sm text-cyan-400 break-all">{currentUserAddress}</span></p>
      <div className="bg-gray-800/50 border border-purple-500/30 rounded-lg p-4 w-full">
        <p className="text-xl">
          Nyumbang, bisanya cuma: 
        </p>
        <p className="font-bold text-4xl text-yellow-400 my-2">
          {isHargaLoading ? '...' : (typeof harga === 'bigint' ? `${Number(harga) / 1e18} MON` : 'N/A')}
        </p>
      </div>
      
      <button 
        onClick={handleBeliProduk} 
        disabled={isWriteLoading}
        className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 px-6 rounded-lg text-lg shadow-lg shadow-cyan-500/50 transition-all duration-300 disabled:bg-gray-600 disabled:shadow-none disabled:cursor-not-allowed"
      >
        {isWriteLoading ? 'Processing...' : 'NYUMBANG (0.5 MON)'}
      </button>

      {isBeliSuccess && (
        <div className="text-green-400">
          Sumbangan berhasil! Cek hash transaksi: <a href={`https://testnet.monadexplorer.com/tx/${hash}`} target="_blank" rel="noopener noreferrer" className="underline">{hash?.slice(0, 10)}...</a>
        </div>
      )}

      {currentUserAddress === ownerAddress && (
        <button 
          onClick={() => onNavigate('admin')}
          className="text-purple-400 hover:text-white"
        >
          Masuk Panel Admin
        </button>
      )}

      <button onClick={() => disconnect()} className="mt-4 text-gray-500 hover:text-red-500 transition-colors">
        Disconnect?!
      </button>
    </div>
  );
}

// --- Komponen Halaman Admin ---
function AdminPage({ onNavigate }: PageProps) {
  const { writeContract, isPending: isWriteLoading, data: hash, isSuccess } = useWriteContract();
  
  function handleTarikDana() {
    writeContract({
      address: vendingMachineAddress,
      abi: vendingMachineAbi,
      functionName: 'tarikDana',
    });
  }

  return (
    <div className="border border-red-500/50 p-6 rounded-xl shadow-lg shadow-red-500/20 text-center animate-fade-in">
        <h3 className="text-2xl font-bold text-red-400 mb-2">-- PANEL KONTROL NOSTRO --</h3>
        <p className="text-gray-300 mb-4">Selamat datang, Bos!</p>
        <button 
            onClick={handleTarikDana} 
            disabled={isWriteLoading}
            className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-red-500/50 transition-all duration-300 disabled:bg-gray-600"
        >
            {isWriteLoading ? 'Processing...' : 'TARIK SEMUA DANA JARAHAN'}
        </button>
        {isSuccess && (
          <div className="text-green-400 mt-2">
            Dana berhasil ditarik! Cek hash: <a href={`https://testnet.monadexplorer.com/tx/${hash}`} target="_blank" rel="noopener noreferrer" className="underline">{hash?.slice(0, 10)}...</a>
          </div>
        )}
        <button onClick={() => onNavigate('home')} className="mt-4 text-gray-400 hover:text-white w-full">
          Kembali ke Halaman Utama
        </button>
    </div>
  )
}

// --- Komponen Halaman Roadmap ---
function RoadmapPage({ onNavigate }: PageProps) {
  const roadMapItems = [
    { q: 'Q2 2025', title: 'Sumbang Mon Ke Nostro', status: 'Selesai' },
    { q: 'Q2 2025', title: 'Nostro Banyak Mon', status: 'Bismillah' },
    { q: 'Q2 - Monad Mainnet', title: 'Nostro Leluasa Bikin Dapp di Monad', status: 'In Progress' },
    { q: 'Updated Soon', title: 'Monad Berkembang Karena Nostro', status: 'To Do' },
  ];

  return (
    <div className="p-4 text-center animate-fade-in">
      <h2 className="text-3xl font-bold mb-6 text-yellow-400">ROADMAP MEMBANGUN MONAD</h2>
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
          Kembali
        </button>
    </div>
  );
}

// --- Komponen Footer (dengan Logika Popup) ---
function Footer() {
    const [popupMessage, setPopupMessage] = useState<string | null>(null);

    return (
      <> {/* React Fragment agar bisa merender footer dan popup bersamaan */}
        <footer className="w-full p-4 mt-8 flex justify-center items-center space-x-6">
            {/* Tombol Twitter tetap link biasa */}
            <a href="https://twitter.com/nostrodetion" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-cyan-400 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
            </a>
            
            {/* Tombol LinkedIn sekarang memicu popup */}
            <button onClick={() => setPopupMessage('LinkedIn | COMING SOON')} className="text-gray-400 hover:text-cyan-400 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
            </button>
            
            {/* Tombol Portfolio sekarang memicu popup */}
            <button onClick={() => setPopupMessage('Portfolio | UNDER CONSTRUCTION')} className="text-gray-400 hover:text-cyan-400 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"></path></svg>
            </button>
        </footer>

        {/* Logika untuk menampilkan popup jika ada pesan */}
        {popupMessage && <ComingSoonPopup message={popupMessage} onClose={() => setPopupMessage(null)} />}
      </>
    )
}


// --- Komponen Utama Aplikasi (Sebagai 'Router') ---
function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const { connectors, connect } = useConnect();
  const { address, isConnected } = useAccount();

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

  const renderPage = () => {
    if (!isConnected) {
      return (
        <div className="text-center p-4 animate-fade-in">
          <h2 className="text-2xl font-bold text-red-500 animate-pulse mb-4">Connect Wallet Heula Atuh Kehed!!</h2>
          {connectors.map((connector) => (
            <button
              key={connector.uid}
              onClick={() => connect({ connector })}
              type="button"
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-purple-500/50 transition-all duration-300 mb-2"
            >
              Connect {connector.name}
            </button>
          ))}
        </div>
      );
    }
    
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

  return (
    // Kembali ke versi style yang lama sesuai permintaan
    <div className="text-white min-h-screen flex flex-col items-center justify-center p-4 font-sans">
      {/* Background Batik */}
      <div 
        style={{ backgroundImage: `url('/background.png')` }}
        className="fixed inset-0 z-[-1] bg-cover bg-center bg-no-repeat"
      ></div>
      {/* Lapisan Filter Cyberpunk di atas Batik */}
      <div className="fixed inset-0 z-[-1] bg-black/70 backdrop-blur-sm"></div>
      
      <div className="w-full max-w-2xl">
        <header className="w-full text-center backdrop-blur-sm bg-black/20 p-4 rounded-xl mb-6">
          <h1 className="text-4xl md:text-5xl font-bold text-cyan-400 mb-2 tracking-widest uppercase">Membangun Monad</h1>
          <p className="text-gray-400">bersama <span className="font-bold text-white">Nostrodetion</span></p>
          <div className="mt-4 flex justify-center space-x-6 border-t border-purple-500/20 pt-4">
              <button onClick={() => navigate('home')} className="text-purple-400 hover:text-white font-bold">HOME</button>
              <button onClick={() => navigate('roadmap')} className="text-purple-400 hover:text-white font-bold">ROADMAP</button>
          </div>
        </header>
        
        <main className="w-full bg-black/30 backdrop-blur-sm p-2 md:p-6 rounded-xl border border-cyan-500/20">
          {renderPage()}
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default App;
