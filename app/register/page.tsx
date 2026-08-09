import Container from "@/components/ui/Container";
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {

return (

<Container className="max-w-md py-24">

<h1 className="mb-8 text-3xl font-light">
Create Account
</h1>

<RegisterForm />

</Container>

);

}