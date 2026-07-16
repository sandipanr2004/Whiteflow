"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Turnstile } from '@marsidev/react-turnstile';

export default function AuthSwitch({ onSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loginToken, setLoginToken] = useState("");
  const [signupToken, setSignupToken] = useState("");
  const { login, signup } = useAuth();

  useEffect(() => {
    const container = document.querySelector(".container-auth");
    if (!container) return;
    if (isSignUp) container.classList.add("sign-up-mode");
    else container.classList.remove("sign-up-mode");
  }, [isSignUp]);

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .container-auth {
          position: relative;
          width: 100%;
          max-width: 900px;
          height: 550px;
          background: white;
          border-radius: 20px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
          overflow: hidden;
        }

        .container-auth .forms-container {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
        }

        .container-auth .signin-signup {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(0%, -50%);
          width: 50%;
          transition: transform 1s 0.7s ease-in-out;
          display: grid;
          grid-template-columns: 1fr;
          z-index: 5;
        }

        .container-auth form {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          padding: 0 5rem;
          transition: all 0.2s 0.7s;
          overflow: hidden;
          grid-column: 1 / 2;
          grid-row: 1 / 2;
        }

        .container-auth form.sign-up-form {
          opacity: 0;
          z-index: 1;
        }

        .container-auth form.sign-in-form {
          z-index: 2;
        }

        .container-auth .title {
          font-size: 2.2rem;
          color: #444;
          margin-bottom: 10px;
          font-weight: 700;
        }

        .container-auth .input-field {
          max-width: 380px;
          width: 100%;
          background-color: #f0f0f0;
          margin: 10px 0;
          height: 55px;
          border-radius: 55px;
          display: grid;
          grid-template-columns: 15% 85%;
          padding: 0 0.4rem;
          position: relative;
          transition: 0.3s;
        }

        .container-auth .input-field:focus-within {
          background-color: #e8e8e8;
          box-shadow: 0 0 0 2px #f8e178;
        }

        .container-auth .input-field i {
          text-align: center;
          line-height: 55px;
          color: #666;
          transition: 0.5s;
          font-size: 1.1rem;
        }

        .container-auth .input-field input {
          background: none;
          outline: none;
          border: none;
          line-height: 1;
          font-weight: 500;
          font-size: 1rem;
          color: #333;
          width: 100%;
        }

        /* Fix browser autofill yellow background */
        .container-auth .input-field input:-webkit-autofill,
        .container-auth .input-field input:-webkit-autofill:hover, 
        .container-auth .input-field input:-webkit-autofill:focus, 
        .container-auth .input-field input:-webkit-autofill:active {
            -webkit-box-shadow: 0 0 0 30px #f0f0f0 inset !important;
            -webkit-text-fill-color: #333 !important;
        }
        
        .container-auth .input-field:focus-within input:-webkit-autofill,
        .container-auth .input-field:focus-within input:-webkit-autofill:hover, 
        .container-auth .input-field:focus-within input:-webkit-autofill:focus, 
        .container-auth .input-field:focus-within input:-webkit-autofill:active {
            -webkit-box-shadow: 0 0 0 30px #e8e8e8 inset !important;
        }

        .container-auth .input-field input::placeholder {
          color: #aaa;
          font-weight: 400;
        }

        .container-auth .btn {
          width: 150px;
          background-color: #f8e178;
          border: none;
          outline: none;
          height: 49px;
          border-radius: 49px;
          color: #171e19;
          text-transform: uppercase;
          font-weight: 600;
          margin: 10px 0;
          cursor: pointer;
          transition: 0.5s;
          font-size: 0.9rem;
        }

        .container-auth .btn:hover {
          background-color: #e6d065;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(248, 225, 120, 0.4);
        }

        .container-auth .panels-container {
          position: absolute;
          height: 100%;
          width: 100%;
          top: 0;
          left: 0;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
        }

        .container-auth .panel {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: space-around;
          text-align: center;
          z-index: 6;
        }

        .container-auth .left-panel {
          pointer-events: all;
          padding: 3rem 17% 2rem 12%;
        }

        .container-auth .right-panel {
          pointer-events: none;
          padding: 3rem 12% 2rem 17%;
        }

        .container-auth .panel .content {
          color: #fff;
          transition: transform 0.9s ease-in-out;
          transition-delay: 0.6s;
        }

        .container-auth .panel h3 {
          font-weight: 600;
          line-height: 1;
          font-size: 1.5rem;
          margin-bottom: 10px;
        }

        .container-auth .panel p {
          font-size: 0.95rem;
          padding: 0.7rem 0;
        }

        .container-auth .btn.transparent {
          margin: 0;
          background: none;
          border: 2px solid #fff;
          color: #fff;
          width: 130px;
          height: 41px;
          font-weight: 600;
          font-size: 0.8rem;
        }

        .container-auth .btn.transparent:hover {
          background: #fff;
          color: #171e19;
          transform: translateY(-2px);
        }

        .container-auth .right-panel .content {
          transform: translateX(800px);
        }

        .container-auth.sign-up-mode:before {
          transform: translate(100%, -50%);
        }

        .container-auth.sign-up-mode .left-panel .content {
          transform: translateX(-800px);
        }

        .container-auth.sign-up-mode .signin-signup {
          transform: translate(-100%, -50%);
        }

        .container-auth.sign-up-mode form.sign-up-form {
          opacity: 1;
          z-index: 2;
        }

        .container-auth.sign-up-mode form.sign-in-form {
          opacity: 0;
          z-index: 1;
        }

        .container-auth.sign-up-mode .right-panel .content {
          transform: translateX(0%);
        }

        .container-auth.sign-up-mode .left-panel {
          pointer-events: none;
        }

        .container-auth.sign-up-mode .right-panel {
          pointer-events: all;
        }

        .container-auth:before {
          content: "";
          position: absolute;
          height: 2000px;
          width: 2000px;
          top: -10%;
          right: 48%;
          transform: translateY(-50%);
          background: linear-gradient(-45deg, #171e19 0%, #272727 100%);
          transition: transform 1.8s ease-in-out;
          border-radius: 50%;
          z-index: 6;
        }

        .container-auth .social-text {
          padding: 0.7rem 0;
          font-size: 1rem;
          color: #666;
        }

        .container-auth .social-media {
          display: flex;
          justify-content: center;
          gap: 15px;
        }

        .container-auth .social-icon {
          height: 46px;
          width: 46px;
          display: flex;
          justify-content: center;
          align-items: center;
          border: 1px solid #ddd;
          border-radius: 50%;
          color: #171e19;
          font-size: 1.2rem;
          transition: 0.3s;
          cursor: pointer;
        }

        .container-auth .social-icon:hover {
          border-color: #f8e178;
          color: #f8e178;
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }

        .container-auth .social-icon svg {
          transition: 0.3s;
        }

        @media (max-width: 870px) {
          .container-auth {
            min-height: 800px;
            height: 100vh;
          }
          .container-auth .signin-signup {
            width: 100%;
            top: 95%;
            transform: translate(-50%, -100%);
            transition: 1s 0.8s ease-in-out;
          }
          .container-auth .signin-signup,
          .container-auth.sign-up-mode .signin-signup {
            left: 50%;
          }
          .container-auth .panels-container {
            grid-template-columns: 1fr;
            grid-template-rows: 1fr 2fr 1fr;
          }
          .container-auth .panel {
            flex-direction: row;
            justify-content: space-around;
            align-items: center;
            padding: 2.5rem 8%;
            grid-column: 1 / 2;
          }
          .container-auth .right-panel {
            grid-row: 3 / 4;
          }
          .container-auth .left-panel {
            grid-row: 1 / 2;
          }
          .container-auth .panel .content {
            padding-right: 15%;
            transition: transform 0.9s ease-in-out;
            transition-delay: 0.8s;
          }
          .container-auth .panel h3 {
            font-size: 1.2rem;
          }
          .container-auth .panel p {
            font-size: 0.7rem;
            padding: 0.5rem 0;
          }
          .container-auth .btn.transparent {
            width: 110px;
            height: 35px;
            font-size: 0.7rem;
          }
          .container-auth:before {
            width: 1500px;
            height: 1500px;
            transform: translateX(-50%);
            left: 30%;
            bottom: 68%;
            right: initial;
            top: initial;
            transition: 2s ease-in-out;
          }
          .container-auth.sign-up-mode:before {
            transform: translate(-50%, 100%);
            bottom: 32%;
            right: initial;
          }
          .container-auth.sign-up-mode .left-panel .content {
            transform: translateY(-300px);
          }
          .container-auth.sign-up-mode .right-panel .content {
            transform: translateY(0px);
          }
          .container-auth .right-panel .content {
            transform: translateY(300px);
          }
          .container-auth.sign-up-mode .signin-signup {
            top: 5%;
            transform: translate(-50%, 0);
          }
        }

        @media (max-width: 570px) {
          .container-auth form {
            padding: 0 1.5rem;
          }
          .container-auth .panel .content {
            padding: 0.5rem 1rem;
          }
        }
      `}</style>

      <div className="container-auth">
        <div className="forms-container">
          <div className="signin-signup">
            {/* Sign In Form */}
            <form 
              className="sign-in-form" 
              onSubmit={async (e) => {
                e.preventDefault();
                const username = e.target.querySelector('input[type="text"]').value;
                const password = e.target.querySelector('input[type="password"]').value;
                if (!username || !password) return;
                if (!loginToken) {
                  alert("Please complete the security check.");
                  return;
                }
                const success = await login(username, password, loginToken);
                if (success && onSuccess) onSuccess();
              }}
            >
              <h2 className="title">Sign in</h2>
              <div className="input-field">
                <i>👤</i>
                <input type="text" placeholder="Username" />
              </div>
              <div className="input-field">
                <i>🔒</i>
                <input type="password" placeholder="Password" />
              </div>
              <div style={{ margin: "10px 0" }}>
                <Turnstile siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"} onSuccess={setLoginToken} />
              </div>
              <input type="submit" value="Login" className="btn solid" disabled={!loginToken} />
              <p className="social-text">Or sign in with social platforms</p>
              {/* Social Icons */}
              <div className="social-media">
                <SocialIcons />
              </div>
            </form>

            {/* Sign Up Form */}
            <form 
              className="sign-up-form" 
              onSubmit={async (e) => {
                e.preventDefault();
                const username = e.target.querySelector('input[type="text"]').value;
                const email = e.target.querySelector('input[type="email"]').value;
                const password = e.target.querySelector('input[type="password"]').value;
                if (!username || !email || !password) return;
                if (!signupToken) {
                  alert("Please complete the security check.");
                  return;
                }
                const success = await signup(username, email, password, signupToken);
                if (success && onSuccess) onSuccess();
              }}
            >
              <h2 className="title">Sign up</h2>
              <div className="input-field">
                <i>👤</i>
                <input type="text" placeholder="Username" />
              </div>
              <div className="input-field">
                <i>📧</i>
                <input type="email" placeholder="Email" />
              </div>
              <div className="input-field">
                <i>🔒</i>
                <input type="password" placeholder="Password" />
              </div>
              <div style={{ margin: "10px 0" }}>
                <Turnstile siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"} onSuccess={setSignupToken} />
              </div>
              <input type="submit" value="Sign up" className="btn" disabled={!signupToken} />
              <p className="social-text">Or sign up with social platforms</p>
              {/* Social Icons */}
              <div className="social-media">
                <SocialIcons />
              </div>
            </form>
          </div>
        </div>

        <div className="panels-container">
          <div className="panel left-panel">
            <div className="content">
              <h3>New here?</h3>
              <p>Join us today and discover a world of possibilities. Create your account in seconds!</p>
              <button className="btn transparent" onClick={() => setIsSignUp(true)}>
                Sign up
              </button>
            </div>
          </div>

          <div className="panel right-panel">
            <div className="content">
              <h3>One of us?</h3>
              <p>Welcome back! Sign in to continue your journey with us.</p>
              <button className="btn transparent" onClick={() => setIsSignUp(false)}>
                Sign in
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ✅ Separated for cleaner JSX
function SocialIcons() {
  return (
    <>
      <a href="/oauth2/authorization/google" className="social-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
      </a>
      <a href="/oauth2/authorization/github" className="social-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
      </a>
    </>
  );
}
