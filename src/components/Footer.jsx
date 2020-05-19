import React from "react";

function Footer() {
  const year = new Date().getFullYear();
  return (
    <div>
      <footer>
        <p>Copyright ⓒ {year}  Author Richard Williams</p>
      </footer>
    </div>
  );
}

export default Footer;
