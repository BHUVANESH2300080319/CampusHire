function Login() {
  return (
    <main>
      <h1>Login to CampusHire</h1>

      <form>
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
          />
        </div>

        <button type="submit">Login</button>
      </form>
    </main>
  )
}

export default Login