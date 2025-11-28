// loop-lab/loopLabStyles.js - CSS animations (optimized for Chromebooks)

export const animationStyles = `
@keyframes fall {
  0% { transform: translateY(-10px); opacity: 1; }
  100% { transform: translateY(100vh); opacity: 0; }
}

@keyframes float-up {
  0% { transform: translateY(0) scale(1); opacity: 1; }
  100% { transform: translateY(-50px) scale(1.1); opacity: 0; }
}

@keyframes pop {
  0% { transform: scale(0.8); opacity: 0; }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-6px); }
  40% { transform: translateX(6px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 5px currentColor; }
  50% { box-shadow: 0 0 15px currentColor; }
}

@keyframes slide-left {
  0% { transform: translateX(-30px); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}

@keyframes slide-right {
  0% { transform: translateX(30px); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}

@keyframes slide-up {
  0% { transform: translateY(20px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

@keyframes bounce-small {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

@keyframes spin-slow {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes count-up {
  0% { transform: scale(1.3); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.anim-fall { animation: fall 2s ease-out forwards; }
.anim-float { animation: float-up 0.8s ease-out forwards; }
.anim-pop { animation: pop 0.3s ease-out forwards; }
.anim-shake { animation: shake 0.4s ease-out; }
.anim-glow { animation: pulse-glow 1s ease-in-out infinite; }
.anim-slide-l { animation: slide-left 0.3s ease-out forwards; }
.anim-slide-r { animation: slide-right 0.3s ease-out forwards; }
.anim-slide-up { animation: slide-up 0.3s ease-out forwards; }
.anim-bounce { animation: bounce-small 1s ease-in-out infinite; }
.anim-spin { animation: spin-slow 2s linear infinite; }
.anim-count { animation: count-up 0.2s ease-out; }
`;