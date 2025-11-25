import { Link } from 'react-router-dom'

export default function Header(){
        return (
            <header>
                <h1>Justin Madren's Jovial Mountain lion || ITIS - 3135</h1>
                <nav>
                    <Link to="/">Home</Link> ||{' '}
                    <Link to="/introduction">Introduction</Link> ||{' '}
                    <Link to="/contract">Contract</Link> ||{' '}
                    <Link to="/jsonintroductions">JSON Introductions</Link>
                </nav>
            </header>
        )
}