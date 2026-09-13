import React, { HTMLAttributes } from 'react';
import styles from './Card.module.css';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'base' | 'feature' | 'featureYellowBold' | 'featurePeach' | 'featureRose' | 'featureMint' | 'featureLavender' | 'featureSky' | 'featureYellow' | 'featureCream' | 'agentTile' | 'pricing' | 'pricingFeatured' | 'workspaceMockup' | 'testimonial';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', variant = 'base', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`${styles.card} ${styles[variant]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';
