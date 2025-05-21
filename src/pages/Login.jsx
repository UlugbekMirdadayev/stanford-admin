import { useState } from "react";
import { useForm } from "react-hook-form";
import Select from "../components/Select";
import Input from "../components/Input";
import { ArrowLeft, Loader, Logo, MessageIcon } from "../assets/icons";
import { useDispatch } from "react-redux";
import { setUser } from "../store/slices/userSlice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const {
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    register,
  } = useForm({
    defaultValues: {
      phone: "",
      password: "",
    },
  });

  const formatPhoneNumber = (value) => {
    if (!value) return "+998 ";

    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, "");

    // Check if the number starts with country code
    const hasCountryCode = cleaned.startsWith("998");
    const digits = hasCountryCode ? cleaned.substring(3) : cleaned;

    // Format the remaining digits
    const match = digits.match(/^(\d{0,2})(\d{0,3})(\d{0,2})(\d{0,2})$/);
    if (!match) return "+998 ";

    // Construct the formatted phone number
    let formatted = "+998";
    if (match[1]) formatted += ` ${match[1]}`;
    if (match[2]) formatted += ` ${match[2]}`;
    if (match[3]) formatted += ` ${match[3]}`;
    if (match[4]) formatted += ` ${match[4]}`;

    return formatted;
  };

  const handlePhoneInput = (e) => {
    const input = e.target.value;

    // Remove all non-digit characters
    const numericValue = input.replace(/\D/g, "");
    const phoneValue = numericValue.startsWith("998")
      ? numericValue
      : "998" + numericValue;

    // Format to display
    const formattedValue = formatPhoneNumber(phoneValue);

    // Set formatted value directly
    setValue("phone", formattedValue, {
      shouldValidate: true,
      shouldTouch: true,
    });

    // Adjust cursor
    const cursorPosition = e.target.selectionStart;
    const addedChars = formattedValue.length - input.length;
    const newCursorPosition =
      addedChars > 0 && cursorPosition > 0
        ? cursorPosition + addedChars
        : cursorPosition;

    return {
      value: formattedValue,
      cursorPosition: newCursorPosition,
    };
  };

  const handlePhoneChange = (e) => {
    const result = handlePhoneInput(e);
    e.target.value = result.value;

    // Restore cursor position after state update
    setTimeout(() => {
      e.target.setSelectionRange(result.cursorPosition, result.cursorPosition);
    }, 0);
  };
  const onSubmit = (values) => {
    const dataForm = values;

    dataForm.phone = dataForm.phone.replace(/\D/g, "");
    setLoading(true);
    const API = new Promise((resolve, reject) => {
      setTimeout(() => {
        if (
          dataForm.phone === "998777777777" &&
          dataForm.password === "123456"
        ) {
          resolve({
            token:
              "CXdsvfghjklewgv*&^%$#@!@#$%^&*()CVBNMFDCXCVBNM3V55VB4NTUUTRGVRTShcvhjkl",
            admin: {
              _id: 1,
              fullName: "Admin Stanford",
              phone: dataForm.phone,
            },
          });
        } else {
          reject({
            response: {
              data: {
                message: "Неверный номер телефона или пароль",
              },
            },
          });
        }
      }, 1000);
    });

    API.then((data) => {
      dispatch(
        setUser({
          token: data.token,
          user: data.admin,
        })
      );
      reset();
      toast.success("Вход выполнен успешно!");
      navigate("/", {
        replace: true,
      });
    })
      .catch((err) => {
        const text = err?.response?.data?.message || err?.message;
        toast.error(text || "Ошибка при входе!");
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="login-wrapper">
      <div className="left-side">
        <Logo color={"#fff"} />
        <a
          href="https://t.me/Ulugbek_Mirdadaev"
          target="_blank"
          rel="nooperer noreferer"
          className="developer-link"
        >
          <MessageIcon />
          <span>Сообщение разработчикам</span>
        </a>
      </div>
      <form className="right-side" onSubmit={handleSubmit(onSubmit)}>
        <h3>Вход</h3>
        <p>
          Введите номер телефона
          <br /> и пароль для входа
        </p>
        <Input
          {...register("phone", {
            pattern: {
              value: /^\+998 \d{2} \d{3} \d{2} \d{2}$/,
              message:
                "Номер телефона должен начинаться с +998 и состоять из 9 цифр",
            },
            required: true,
          })}
          label="Ваш номер телефона"
          placeholder="+998 90 123 45 67"
          error={errors.phone?.message}
          value={watch("phone")}
          onChange={handlePhoneChange}
          autoFocus
          disabled={loading}
        />

        <Input
          type="password"
          label="Пароль"
          {...register("password", { required: true })}
          placeholder="●●●●●"
          rightSection={
            <button type="submit" disabled={loading}>
              <div className="icon">{loading ? <Loader /> : <ArrowLeft />}</div>
            </button>
          }
          required
          disabled={loading}
        />
        <div className="footer-copyright">
          <p>© Uflex. Все права защищены.</p>
          <span>v1.0 — Первоначальный релиз.</span>
        </div>
      </form>
    </div>
  );
};

export default Login;
