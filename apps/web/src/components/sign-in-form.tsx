import { authClient } from '@/lib/auth-client';
import { Link, useNavigate } from 'react-router';
import Loader from './loader';
import { Button } from './ui/button';
import GoogleIcon from './icon/google';

export default function SignInForm() {
  const signIn = async () => {
    await authClient.signIn.social({
      provider: 'google',
      callbackURL: `${import.meta.env.VITE_BASE_URL}/dashboard`,
    });
  };

  return (
    <section className="bg-linear-to-b from-muted to-background flex min-h-screen px-4 py-16 md:py-32">
      <form className="max-w-92 m-auto h-fit w-full">
        <div className="p-6">
          <div>
            <Link to="/mist" aria-label="go home"></Link>
            <h1 className="mt-6 text-balance text-xl font-semibold">
              <span className="text-muted-foreground">
                Selamat datang ke Gawego!
              </span>{' '}
              Masuk ke akun anda
            </h1>
          </div>
          <div className="mt-6 space-y-2">
            <Button
              type="button"
              onClick={signIn}
              variant="outline"
              size="default"
              className="w-full"
            >
              <GoogleIcon />
              <span>Google</span>
            </Button>
          </div>
        </div>
        <div className="px-6">
          <p className="text-muted-foreground text-sm">
            Belum punya akun?
            <Button asChild variant="link" className="px-2">
              <Link to="/register">Daftar sekarang</Link>
            </Button>
          </p>
        </div>
      </form>
    </section>
  );
}
