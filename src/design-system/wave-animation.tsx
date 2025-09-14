import './wave-animation.css';

type WaveAnimationProps = {
  className?: string;
};

const WaveAnimation = ({ className = '' }: WaveAnimationProps) => {
  return (
    <div
      className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${className}`}
    >
      <div className='absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-blue-400/20 animate-wave'></div>
      <div className='absolute inset-0 bg-gradient-to-r from-purple-400/15 via-blue-400/15 to-purple-400/15 animate-wave-reverse'></div>
      <div className='absolute inset-0 bg-gradient-to-r from-cyan-400/10 via-blue-400/10 to-cyan-400/10 animate-wave-slow'></div>
    </div>
  );
};

export default WaveAnimation;
