export const CARDS = [
  {
    id: 'terminal', title: 'NET_Terminal', status: 'ONLINE', icon: 'Terminal', href: '/terminal',
    colors: {
      border: 'border-cyan-500/50',
      bgHeader: 'bg-cyan-950',
      textTitle: 'text-cyan-300',
      textStatus: 'text-cyan-400',
      icon: 'text-cyan-500/40',
      shadow: 'shadow-[0_0_20px_rgba(0,255,255,0.2)]'
    }
  },
  {
    id: 'linux', title: 'Linux Sandbox', status: 'ONLINE', icon: 'Terminal', href: '/linux',
    colors: {
      border: 'border-emerald-500/50',
      bgHeader: 'bg-emerald-950',
      textTitle: 'text-emerald-300',
      textStatus: 'text-emerald-400',
      icon: 'text-emerald-500/40',
      shadow: 'shadow-[0_0_20px_rgba(16,185,129,0.2)]',
      overlayText: '',
      overlayShadow: ''
    }
  },
  {
    id: 'memory', title: 'Memory Match', status: 'OFFLINE', icon: 'Gamepad2', href: '#',
    colors: {
      border: 'border-pink-500/50',
      bgHeader: 'bg-pink-950',
      textTitle: 'text-pink-300',
      textStatus: 'text-pink-500/50',
      icon: 'text-pink-500/40',
      shadow: 'shadow-[0_0_20px_rgba(236,72,153,0.2)]',
      overlayText: 'text-pink-400 border-pink-500',
      overlayShadow: 'shadow-[0_0_15px_rgba(236,72,153,0.5)]'
    }
  }
];
