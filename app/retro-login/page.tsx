import { Metadata } from 'next';
import RetroLogin from '@/../components/RetroLogin';

export const metadata: Metadata = {
    title: 'Retro-Futurism Login | Tomorrow Archive',
    description: 'A responsive retro-futurism login component combining vintage technology aesthetics with space-age forms.',
};

export default function RetroLoginPage() {
    return <RetroLogin />;
}
