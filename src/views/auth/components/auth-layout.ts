/**
 * Auth Layout Component
 * Split layout with branding on left, form on right
 * Responsive: full width on mobile
 */

/**
 * Get auth layout styles
 */
export function getAuthLayout(): string {
  return `
    /* Auth Container - Split Layout */
    .auth-container {
      display: flex;
      min-height: 100vh;
      width: 100%;
    }

    /* Left Side - Branding */
    .auth-branding {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
      position: relative;
      overflow: hidden;
      padding: 3rem;
    }

    .auth-branding-content {
      position: relative;
      z-index: 2;
      max-width: 480px;
      animation: slideInLeft 0.6s ease-out;
    }

    /* Logo */
    .auth-logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 3rem;
      transition: opacity var(--transition-fast);
    }

    .auth-logo:hover {
      opacity: 0.8;
    }

    .auth-logo svg {
      flex-shrink: 0;
    }

    /* Tagline */
    .auth-tagline {
      margin-bottom: 2.5rem;
    }

    .auth-tagline h1 {
      font-size: clamp(2rem, 4vw, 2.75rem);
      font-weight: 800;
      line-height: 1.2;
      margin-bottom: 1rem;
    }

    .auth-tagline p {
      font-size: 1.125rem;
      color: var(--text-secondary);
      line-height: 1.6;
    }

    /* Features List */
    .auth-features {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .auth-feature {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: var(--text-secondary);
      font-size: 0.9375rem;
    }

    .auth-feature-icon {
      width: 20px;
      height: 20px;
      color: var(--success);
      flex-shrink: 0;
    }

    /* Decorative Elements */
    .auth-decoration {
      position: absolute;
      inset: 0;
      overflow: hidden;
      pointer-events: none;
    }

    .auth-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.4;
    }

    .auth-orb-1 {
      width: 400px;
      height: 400px;
      background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
      top: -100px;
      right: -100px;
      animation: float 8s ease-in-out infinite;
    }

    .auth-orb-2 {
      width: 300px;
      height: 300px;
      background: linear-gradient(135deg, var(--accent-secondary), var(--accent-tertiary));
      bottom: -50px;
      left: -50px;
      animation: float 10s ease-in-out infinite reverse;
    }

    .auth-grid-lines {
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
      background-size: 40px 40px;
      mask-image: radial-gradient(ellipse 60% 60% at 50% 50%, black 40%, transparent 100%);
    }

    /* Right Side - Form Container */
    .auth-form-container {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: var(--bg-primary);
      position: relative;
    }

    .auth-form-wrapper {
      width: 100%;
      max-width: 420px;
      animation: slideInRight 0.6s ease-out;
    }

    /* Mobile - Stack layout */
    @media (max-width: 1024px) {
      .auth-container {
        flex-direction: column;
      }

      .auth-branding {
        padding: 2rem;
        min-height: auto;
      }

      .auth-branding-content {
        max-width: 100%;
        text-align: center;
      }

      .auth-tagline h1 {
        font-size: 1.75rem;
      }

      .auth-tagline p {
        font-size: 1rem;
      }

      .auth-features {
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: center;
        gap: 0.75rem 1.5rem;
      }

      .auth-feature {
        font-size: 0.875rem;
      }

      .auth-logo {
        justify-content: center;
        margin-bottom: 1.5rem;
      }

      .auth-orb-1 {
        width: 200px;
        height: 200px;
        top: -50px;
        right: -50px;
      }

      .auth-orb-2 {
        width: 150px;
        height: 150px;
        bottom: -30px;
        left: -30px;
      }

      .auth-form-container {
        flex: none;
        padding: 2rem 1.5rem 3rem;
      }
    }

    /* Small mobile */
    @media (max-width: 480px) {
      .auth-branding {
        padding: 1.5rem;
      }

      .auth-tagline {
        margin-bottom: 1.5rem;
      }

      .auth-tagline h1 {
        font-size: 1.5rem;
      }

      .auth-features {
        flex-direction: column;
        align-items: center;
      }

      .auth-form-container {
        padding: 1.5rem 1rem 2rem;
      }

      .auth-form-wrapper {
        max-width: 100%;
      }
    }
  `;
}

export default getAuthLayout;
