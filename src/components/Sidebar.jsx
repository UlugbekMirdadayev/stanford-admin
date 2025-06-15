import { NavLink } from "react-router-dom";
import { setLogout } from "../store/slices/userSlice";
import { useDispatch, useSelector } from "react-redux";
import {
  // Branches,
  // Folder,
  Home,
  Logo,
  Logout,
  // Service,
  SidebarLogo,
  // Time,
  // Truck,
  UserGroup,
  WereHouse,
} from "../assets/icons";
import "../styles/sidebar.css";

const links = [
  // {
  //   title: "Главная",
  //   icon: (props) => <Home {...props} />,
  //   href: "/",
  // },
  {
    title: "Студенты",
    icon: (props) => <UserGroup {...props} />,
    href: "/",
  },
  {
    title: "Учителя",
    icon: (props) => <UserGroup {...props} />,
    href: "/teachers",
  },
  {
    title: "Группы",
    icon: (props) => <WereHouse {...props} />,
    href: "/groups",
  },

  {
    title: "Родители",
    icon: (props) => <UserGroup {...props} />,
    href: "/parents",
  },
  {
    title: "Жалобы",
    icon: (props) => <WereHouse {...props} />,
    href: "/complaints",
  },
  // {
  //   title: "Buyurtmalar",
  //   icon: (props) => <Truck {...props} />,
  //   href: "/orders",
  // },
  // {
  //   title: "Ombor Moduli",
  //   icon: (props) => <WereHouse {...props} />,
  //   href: "/warehouse",
  // },
  // {
  //   title: "Kirim - Chiqim",
  //   icon: (props) => <Folder {...props} />,
  //   href: "/transactions",
  // },
  // {
  //   title: "Mijozlar Moduli",
  //   icon: (props) => <UserGroup {...props} />,
  //   href: "/clients",
  // },
  // {
  //   title: "Xizmatlar",
  //   icon: (props) => <Service {...props} />,
  //   href: "/services",
  // },
  // {
  //   title: "Ishchilar Moduli",
  //   icon: (props) => <UserGroup {...props} />,
  //   href: "/workers",
  // },
  // {
  //   title: "Filiallar",
  //   icon: (props) => <Branches {...props} />,
  //   href: "/branches",
  // },
  // {
  //   title: "To‘lovlar tarixi",
  //   icon: (props) => <Time {...props} />,
  //   href: "/payment-history",
  // },
];

const Sidebar = () => {
  const { user } = useSelector(({ user }) => user);
  const dispatch = useDispatch();
  const handleLogout = () => {
    if (window.confirm("Вы действительно хотите выйти?")) dispatch(setLogout());
  };

  return (
    <div className="sidebar">
      <div className="links-top">
        <NavLink to={user?.isVip ? "/orders" : "/"} className="logo">
          <SidebarLogo /> <Logo width={103} className={undefined} height={13} />
        </NavLink>
        <nav className="nav-links">
          {links
            ?.filter((link) =>
              user.isVip ? ["/orders"].includes(link.href) : true
            )
            .map((link) => (
              <NavLink to={link.href} key={link.href} className="nav-item">
                {link.icon({ color: "currentColor" })}
                <span>{link.title}</span>
              </NavLink>
            ))}
        </nav>
      </div>{" "}
      <button title="Выход" className="logout-btn" onClick={handleLogout}>
        <div className="word-name">{user?.fullName?.[0]}</div>
        <span>{user?.fullName}</span> <Logout />
      </button>
    </div>
  );
};

export default Sidebar;
