import { useState, useRef, useEffect } from 'react';

const LazyImage = ({ 
  src, 
  alt, 
  className = '', 
  placeholder = '/images/placeholder.jpg',
  objectFit = 'cover',
  ...props 
}) => {
  const isContain = objectFit === 'contain';
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  return (
    <div 
      ref={imgRef} 
      className={`lazy-image-container ${isContain ? 'lazy-image-container--contain' : ''} ${className}`.trim()}
      style={{
        position: 'relative',
        overflow: isContain ? 'visible' : 'hidden',
        width: '100%',
        height: isContain ? 'auto' : undefined,
      }}
      {...props}
    >
      {/* Placeholder/Loading state */}
      {!isLoaded && (
        <div 
          className="lazy-image-placeholder"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999'
          }}
        >
          <div className="loading-spinner">
            <div 
              style={{
                width: '40px',
                height: '40px',
                border: '3px solid #f3f3f3',
                borderTop: '3px solid #2f6fcc',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}
            />
          </div>
        </div>
      )}
      
      {/* Actual image */}
      {isInView && (
        <img
          src={hasError ? placeholder : src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            width: '100%',
            height: isContain ? 'auto' : '100%',
            objectFit,
            transition: 'opacity 0.3s ease',
            opacity: isLoaded ? 1 : 0
          }}
        />
      )}
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LazyImage; 