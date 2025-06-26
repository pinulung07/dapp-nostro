// Alamat kontrak VendingMachine V.4 kita yang sudah terverifikasi
export const vendingMachineAddress = '0x95113fe45A8D5cAeA05a2cfea3B4613A4Fa10fc7';

// Menambahkan 'as const' akan membuat wagmi bisa menebak return type dengan akurat
export const vendingMachineAbi = [
    { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" },
    { "inputs": [], "name": "beliProduk", "outputs": [], "stateMutability": "payable", "type": "function" },
    { "inputs": [], "name": "hargaProduk", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
    { "inputs": [ { "internalType": "address", "name": "", "type": "address" } ], "name": "jumlahPembelian", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "owner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "tarikDana", "outputs": [], "stateMutability": "nonpayable", "type": "function" }
] as const;

// Ekspor definisi Jaringan Monad agar bisa diimpor di file lain
export const monadTestnet = {
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: { default: { http: ['https://testnet-rpc.monad.xyz/'] } },
  blockExplorers: { default: { name: 'Monad Explorer', url: 'https://testnet.monadexplorer.com' } },
  testnet: true,
} as const;