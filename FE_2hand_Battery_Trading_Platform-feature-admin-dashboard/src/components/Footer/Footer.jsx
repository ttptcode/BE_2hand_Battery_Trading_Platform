import { FaFacebook, FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa";
import journalBg from "../../assets/img/journal1.png";

const Footer = () => {
  return (
    <footer
      className="text-[80%] w-full shadow-lg text-gray-200 py-8 mt-auto relative overflow-hidden font-mono text-base leading-[1.4]"
      style={{
        position: "relative",
        zIndex: 10,
        backdropFilter: "blur(8px)",
        background: "rgba(24,26,47,0.96)",
      }}
    >
      <img
        src={journalBg}
        alt="footer background"
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
        style={{ opacity: 0.10 }}
      />
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: "linear-gradient(90deg,rgba(0,201,167,0.12),rgba(0,201,167,0.06))",
          mixBlendMode: "lighten",
        }}
      />
      <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-5 gap-10 text-base">
        <div className="col-span-2 md:col-span-1 flex flex-col">
          <h2 className="text-2xl font-extrabold tracking-wide text-emerald-400 drop-shadow mb-1">
            2H AUTO
          </h2>
          <p className="mt-2 text-gray-300 font-medium">FOLLOW US</p>
          <div className="flex space-x-4 mt-2 text-2xl">
            <a
              href="https://www.facebook.com/tran.le.tuan.anh.830328?locale=vi_VN"
              aria-label="Facebook"
              className="hover:text-[#1877f2] transition-colors duration-200"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaFacebook />
            </a>
            <a
              href="https://www.instagram.com/"
              aria-label="Instagram"
              className="hover:text-[#E4405F] transition-colors duration-200"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaInstagram />
            </a>
            <a
              href="https://www.tiktok.com/vi-VN//"
              aria-label="TikTok"
              className="hover:text-gray-900 transition-colors duration-200"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaTiktok />
            </a>
            <a
              href="https://www.youtube.com/c/t%C3%B4i%C4%91icoded%E1%BA%A1oblog"
              aria-label="YouTube"
              className="hover:text-[#be2727] transition-colors duration-200"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaYoutube />
            </a>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-emerald-400 mb-3 text-base">
            Information
          </h3>
          <ul className="space-y-3">
            <li>
              <a
                href="/aboutus"
                className="hover:text-emerald-300 transition-colors duration-200 underline-offset-4 hover:underline"
              >
                2H Auto System
              </a>
            </li>
            <li>
              <a
                href="#"
                className="hover:text-emerald-300 transition-colors duration-200 underline-offset-4 hover:underline"
              >
                2H Auto Service
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-emerald-400 mb-3 text-base">
            Terms & Conditions
          </h3>
          <ul className="space-y-3">
            <li>
              <a
                href="#"
                className="hover:text-emerald-300 transition-colors duration-200 underline-offset-4 hover:underline"
              >
                Membership Regulations
              </a>
            </li>
            <li>
              <a
                href="#"
                className="hover:text-emerald-300 transition-colors duration-200 underline-offset-4 hover:underline"
              >
                Terms and Conditions
              </a>
            </li>
            <li>
              <a
                href="#"
                className="hover:text-emerald-300 transition-colors duration-200 underline-offset-4 hover:underline"
              >
                General Rules and Policies
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-emerald-400 mb-3 text-base">
            Social Network
          </h3>
          <div className="flex flex-col space-y-6">
            <div className="flex space-x-8 text-gray-200 text-2xl">
              <a
                href="https://www.facebook.com/tran.le.tuan.anh.830328?locale=vi_VN"
                aria-label="Facebook"
                className="hover:text-[#1877f2] transition-colors duration-200"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaFacebook />
              </a>
              <a
                href="https://www.instagram.com/"
                aria-label="Instagram"
                className="hover:text-[#E4405F] transition-colors duration-200"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaInstagram />
              </a>
            </div>
            <div className="flex space-x-8 text-gray-200 text-2xl">
              <a
                href="https://www.tiktok.com/vi-VN//"
                aria-label="TikTok"
                className="hover:text-gray-900 transition-colors duration-200"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaTiktok />
              </a>
              <a
                href="https://www.youtube.com/c/t%C3%B4i%C4%91icoded%E1%BA%A1oblog"
                aria-label="YouTube"
                className="hover:text-[#be2727] transition-colors duration-200"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaYoutube />
              </a>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-yellow-600 mb-3 text-base">
            Contact
          </h3>
          <ul className="space-y-3">
            <li>
              <span className="font-medium">Address:</span> 123 Đường D1 Công Nghệ Cao, Quận 9, TP. HCM
            </li>
            <li>
              <span className="font-medium">Support email:</span> cskh@2hauto.vn
            </li>
            <li>
              <span className="font-medium">Hotline:</span> 1800.6969.6969
            </li>
          </ul>
        </div>
      </div>
      <div className="relative z-10 border-t border-emerald-500 mt-8 pt-4 text-xs text-center text-gray-300 font-medium tracking-wide bg-transparent">
        <p className="hover:text-emerald-300 transition-colors duration-200 cursor-pointer">
          Công ty TNHH MTV 2H Auto Việt Nam
        </p>
        <p className="hover:text-emerald-300 transition-colors duration-200 cursor-pointer">
          ©2025 2H Auto | All rights reserved
        </p>
      </div>
    </footer>
  );
};

export default Footer;
