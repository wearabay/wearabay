import ResetPasswordForm from "@/components/auth/ResetPasswordForm";


export default function ResetPasswordPage(){

  return (

    <main
      className="
        mx-auto
        max-w-md
        px-6
        py-24
      "
    >

      <h1 className="mb-8 text-3xl font-light">
        Create New Password
      </h1>


      <ResetPasswordForm />


    </main>

  );

}