import { Theme } from '@clerk/types';

export const neobrutalAuth: Theme = {
    layout: {
        socialButtonsPlacement: 'bottom',
        socialButtonsVariant: 'blockButton',
    },
    variables: {
        colorPrimary: '#FF6B35',
        colorText: '#1E1E1E',
        borderRadius: '0px',
        fontFamily: '"Poppins", sans-serif',
    },
    elements: {
        card: 'border-2 border-black shadow-brutal rounded-none bg-card',
        headerTitle: 'font-head font-bold text-2xl',
        headerSubtitle: 'text-muted-foreground font-body',
        socialButtonsBlockButton: 'border-2 border-black !shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:!shadow-none transition-all duration-200 rounded-none bg-white text-foreground font-head font-bold h-10',
        socialButtonsBlockButtonText: 'font-head font-bold',
        formButtonPrimary: 'bg-primary hover:bg-primary/90 text-primary-foreground border-2 border-black !shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:!shadow-none transition-all duration-200 rounded-none h-10 font-head font-bold',
        formFieldInput: 'border-2 border-black rounded-none shadow-none focus:!shadow-brutal-sm focus:border-black transition-all duration-200 font-body',
        footerActionLink: 'text-primary hover:text-primary/90 font-bold',
        identityPreviewEditButtonIcon: 'text-primary',
        formFieldLabel: 'font-head font-bold text-foreground',
    }
}
