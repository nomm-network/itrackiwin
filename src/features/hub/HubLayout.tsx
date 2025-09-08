type Props = { Header: React.ReactNode; SubMenu: React.ReactNode; Body: React.ReactNode; };

export default function HubLayout({ Header, SubMenu, Body }: Props) {
  return (
    <div className="container py-6">
      <section>{Header}</section>
      <section>{SubMenu}</section>
      <section>{Body}</section>
    </div>
  );
}