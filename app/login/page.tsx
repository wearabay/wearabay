import Container from "@/components/ui/Container";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <Container className="max-w-md py-24">

      <h1 className="mb-8 text-3xl font-light">
        Login
      </h1>

      <LoginForm />

    </Container>
  );
}