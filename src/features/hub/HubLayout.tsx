type Props = {
  Header: React.ReactNode;      // title + Admin + Explore by Planets
  SubMenu: React.ReactNode;     // subcategory chips (+ Configure)
  Body: React.ReactNode;        // the main page content (big card, QA row, etc.)
};

export default function HubLayout({ Header, SubMenu, Body }: Props) {
  return (
    <div className="container py-6">
      <section>{Header}</section>
      <section>{SubMenu}</section>
      <section>{Body}</section>
    </div>
  );
}