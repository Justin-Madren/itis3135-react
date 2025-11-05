export default function Home() {
  return (
    <>
    <style>{`
    body{
      background-color: blanchedalmond;
    }
    h1{
      text-align: center;
      font-family: 'Inter';
    }
    nav{
      padding: 8px;
      text-align: center;
      font-size: 20px;
    }
    h2{
      text-align: center;
      font-family: 'Inter';
    }
    h3{
      font-size: 20px;
      font-family: 'Inter';
    }
    p{
      text-align: center;
      font-family: 'Roboto';
      font-size: 17px;
    }
    .divider{
      width: 90%;
      border-bottom: 3px solid black;
      margin: 0 auto 0;
    }
    a{
      color: darkgreen;
    }
    a:hover{
      color: goldenrod;
      text-decoration: underline;
    }
    `}</style>
      <main>
        <h2>Home</h2>

        <p>Hello this is my 3135 corse page</p>

        <div className="divider"></div>
      </main>

    </>
  );
}
