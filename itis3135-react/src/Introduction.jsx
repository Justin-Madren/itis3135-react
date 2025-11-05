import headshot from './assets/HeadShot2024.jpg'

export default function Introduction() {
    return (
        <>
            <main>
        <h2>Madren Justin M</h2>

        <img
            width="534"
            height="534"
            src={headshot}
            alt="A photo of Justin Madren from the neck with a gray background"
        />

        <p>
            <strong>Personal Statement:</strong> Hello my name is Justin Madren this
            will be my senior year at UNCC. I enjoy playing video games right now. I
            am working my way through Balders Gate 3 in honor mode, I also enjoy
            drawing traditionally and on my tablet from time to time.
        </p>

        <ul>
            <li>
            <strong>Personal Background:</strong> I am a first generation college
            student meaning I am the first in my family to attend a four year
            university in pursuit of a bachelor's degree. I am an eagle scout and
            have been to the Philmont scouting range for a 11 day long
            backpacking trip.
            </li>

            <li>
            <strong>Academic Background:</strong> Senior Computer Science Major
            with a Concentration in Cyber Security
            </li>

            <li>
            <strong>Professional Background:</strong> I have volunteered at my
            local church in the audio visual team from 2014 to today
            </li>

            <li>
            <strong>Primary Computer:</strong> A Dell Latitude 3550 laptop running
            windows 11 primary work location is my apartment
            </li>

            <li>
            <strong>Courses I’am Taking and Why</strong>
            <ul>
                <li>
                <strong>
                    ITSC-3146 - Intro into Operating Systems and Networking :
                </strong>{" "}
                To understand how the OS functions and how networks work and how
                they are connected because everything has some form of networking
                because that is how computers talk to each other.
                </li>

                <li>
                <strong>ITIS-3200 - Intro into Security and Privacy :</strong> My
                consternation is in cyber security and this is the class where I
                am going to learn about the security and privacy aspects of the
                programming world.
                </li>

                <li>
                <strong>ITSC-3135 - Software Engineering :</strong> To build the
                skills and knowledge of how to work in a group for a project and
                doing it using github.
                </li>

                <li>
                <strong>ITIS-3135 - Front-End Web App Development :</strong> For
                an understanding of how web sites are built and how they work.
                </li>
            </ul>
            </li>

            <li>
            <strong>Quote:</strong>
            “That a person who helps others simply because it should or must be
            done, and because it is the right thing to do, is indeed without a
            doubt a real superhero”
            <p>
                <em>- Stan Lee</em>
            </p>
            </li>
        </ul>

        <div className="divider"></div>
                </main>
        </>
    );
}
