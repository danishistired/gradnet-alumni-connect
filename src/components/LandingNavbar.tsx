import CardNav from "./CardNav";
import type { CardNavItem } from "./CardNav";
import logo from '../assets/logo.svg';

interface NavbarProps {
  onMessagesClick?: () => void;
}

export const Navbar = ({ onMessagesClick }: NavbarProps) => {
  // CardNav items configuration
  const cardNavItems: CardNavItem[] = [
    {
      label: "Home",
      bgColor: "#0D0716",
      textColor: "#fff",
      links: [
        { label: "Feed", href: "/feed", ariaLabel: "Go to Feed" },
        { label: "Trending", href: "/trending", ariaLabel: "View Trending Posts" }
      ]
    },
    {
      label: "About", 
      bgColor: "#170D27",
      textColor: "#fff",
      links: [
        { label: "About Us", href: "/about", ariaLabel: "About GradNet" },
        { label: "Contact", href: "/contact", ariaLabel: "Contact Us" }
      ]
    },
    {
      label: "Community",
      bgColor: "#271E37", 
      textColor: "#fff",
      links: [
        { label: "Communities", href: "/communities", ariaLabel: "Browse Communities" },
        { label: "Create Community", href: "/create-community", ariaLabel: "Create New Community" },
        { label: "Alumni Network", href: "/alumni", ariaLabel: "Alumni Network" }
      ]
    }
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4">
      <CardNav
        logo={logo}
        logoAlt="GRADNET Logo"
        items={cardNavItems}
        baseColor="#1a1a1a"
        menuColor="#fff"
        buttonBgColor="#111"
        buttonTextColor="#fff"
        ease="power3.out"
        className="w-full max-w-6xl"
      />
    </div>
  );
};