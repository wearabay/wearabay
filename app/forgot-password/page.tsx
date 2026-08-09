import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";


export default function ForgotPasswordPage(){

  return (

    <main
      className="
        mx-auto
        max-w-md
        px-6
        py-24
      "
    >

      <h1
        className="
          mb-8
          text-3xl
          font-light
        "
      >
        Reset Password
      </h1>


      <ForgotPasswordForm />


    </main>

  );

}