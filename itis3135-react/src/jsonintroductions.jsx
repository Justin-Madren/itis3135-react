import { useEffect, useState } from "react";

export default function JsonIntroductions() {
    const [introductions, setIntroductions] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [baseUrl, setBaseUrl] = useState(null); // origin used when we fetched remote data (e.g. https://dvonb.xyz)
    const [nameSearch, setNameSearch] = useState("");

    // visibility toggles (default to visible)
    const [showName, setShowName] = useState(true);
    const [showMascot, setShowMascot] = useState(true);
    const [showImage, setShowImage] = useState(true);
    const [showStatement, setShowStatement] = useState(true);
    const [showBackgrounds, setShowBackgrounds] = useState(true);
    const [showClasses, setShowClasses] = useState(true);
    const [showExtra, setShowExtra] = useState(true); // computer, funFact, additional
    const [showQuote, setShowQuote] = useState(true);
    const [showLinks, setShowLinks] = useState(true);
    // slideshow state
    const [slideshowOn, setSlideshowOn] = useState(false);
    const [slideshowIndex, setSlideshowIndex] = useState(0);

    useEffect(() => {
        // Try to load a local JSON first (public/students.json), then fallback to the remote API
        const localUrl = "/students.json"; // place a JSON file in public/ to use local data
        const remoteUrl = "https://dvonb.xyz/api/2025-fall/itis-3135/students?full=1";

        async function load() {
            setLoading(true);
            setError(null);

            async function tryFetch(url) {
                try {
                    const r = await fetch(url);
                    if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`);
                    const json = await r.json();
                    if (!Array.isArray(json)) {
                        // Some endpoints wrap the array inside an object
                        if (Array.isArray(json.students)) return json.students;
                        return json;
                    }
                    return json;
                } catch (err) {
                    throw err;
                }
            }

            try {
                const data = await tryFetch(localUrl);
                setIntroductions(normalizeData(data));
            } catch (localErr) {
                // local not found or invalid — try remote
                                try {
                                            const data = await tryFetch(remoteUrl);
                                            // remember remote origin so we can resolve root-relative image URLs
                                            try {
                                                const u = new URL(remoteUrl);
                                                setBaseUrl(u.origin);
                                            } catch (e) {
                                                setBaseUrl('https://dvonb.xyz');
                                            }
                                            setIntroductions(normalizeData(data));
                } catch (remoteErr) {
                    setError(`Failed to load introductions: ${remoteErr.message}`);
                    setIntroductions([]);
                }
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    // keep slideshow index sensible when filter or data changes
    useEffect(() => {
        if (!slideshowOn) return;
        // when the search/filter changes or the data updates, start slideshow at the beginning
        setSlideshowIndex(0);
    }, [nameSearch, introductions, slideshowOn]);

    // Normalize different shapes of JSON responses into an array of student objects
    function normalizeData(raw) {
        if (!raw) return [];
        // If it's already an array
        if (Array.isArray(raw)) return raw.filter(Boolean);

        if (typeof raw === 'object') {
            // Common wrapper fields that hold an array
            for (const key of ["students", "data", "results", "items", "entries"]) {
                if (Array.isArray(raw[key])) return raw[key].filter(Boolean);
            }

            // If the object looks like a map of id => studentObject
            const values = Object.values(raw);
            if (values.length > 0 && values.every(v => typeof v === 'object')) {
                // try to detect student-like objects
                const looksLikeStudent = values.filter(v => v && (v.name || v.firstName || v.lastName || v.media || v.personalStatement || v.personalStatment));
                if (looksLikeStudent.length) return looksLikeStudent;
            }

            // single student object -> return as single-item array
            return [raw];
        }

        // Unknown shape -> empty
        return [];
    }

    if (loading) return <div className="introductions-loading">Loading introductions…</div>;
    if (error) return <div className="introductions-error">{error}</div>;
    if (!introductions || introductions.length === 0)
        return <div className="introductions-empty">No introductions found.</div>;

    // Helper: safely get property with different spellings
    const getStatement = (s) => s.personalStatement ?? s.personalStatment ?? s.bio ?? "";

    function getFullName(s) {
        if (!s) return "";
        if (s.fullName) return s.fullName;
        // if name is a string use it
        if (s.name && typeof s.name === 'string' && s.name.trim().length > 0) return s.name;

        // name could be an object with first/middle/last/preferred
        if (s.name && typeof s.name === 'object') {
            const n = s.name || {};
            if (n.preferred && n.preferred.trim()) return n.preferred;
            const first = n.first ?? n.firstName ?? n.given ?? '';
            const middle = n.middleInitial ?? n.middle ?? '';
            const last = n.last ?? n.lastName ?? n.surname ?? '';
            return `${first} ${middle ? `${middle} ` : ''}${last}`.trim();
        }

        const first = s.name ?? s.firstName ?? s.first ?? '';
        const middle = s.middleInitial ?? s.middle ?? '';
        const last = s.lastName ?? s.last ?? s.surname ?? '';
        return `${first} ${middle ? `${middle} ` : ''}${last}`.trim();
    }

    function getCoursesForStudent(s) {
        let RAW = s.courses ?? s.subjects ?? s.classes ?? s.courseList ?? s.coursesTaken ?? null;

        // support comma/semicolon separated string
        if (typeof RAW === 'string') {
            return RAW.split(/[;,]+/).map(x => x.trim()).filter(Boolean);
        }

        if (Array.isArray(RAW)) return RAW;

        if (typeof RAW === 'object' && RAW !== null) {
            // gather fields like course1, course2 etc.
            const found = [];
            for (const [k, v] of Object.entries(RAW)) {
                if (/course/i.test(k) || /class/i.test(k) || /subject/i.test(k)) {
                    if (typeof v === 'string') found.push(v);
                    else if (v && (v.code || v.name)) found.push(v.code ?? v.name);
                }
            }
            if (found.length) return found;
        }

        // also look at top-level fields course1, course2
        const fallback = [];
        Object.keys(s || {}).forEach(k => {
            const match = k.match(/course(\d+)/i);
            if (match && typeof s[k] === 'string') fallback.push(s[k]);
        });
        if (fallback.length) return fallback;

        return [];
    }

    return (
        <main>
            <h2>Student Introductions</h2>
            <div className="search-row">
                <label className="search-label">Search for student</label>
                <input
                    className="search-input"
                    type="text"
                    placeholder="Search students by name..."
                    value={nameSearch}
                    onChange={(event) => setNameSearch(event.target.value)}
                    aria-label="Search students by name"
                />
                <div className="search-status">Currently: <strong>{nameSearch || 'All'}</strong></div>
            </div>
            

            {/* create a filtered list from the search string (case-insensitive substring match across common name fields) */}

            {/* Toggle controls */}
            <div className="toggle-controls">
                <button className={"toggle-btn" + (showName ? " active" : "")} onClick={() => setShowName(v => !v)}>Name</button>
                <button className={"toggle-btn" + (showMascot ? " active" : "")} onClick={() => setShowMascot(v => !v)}>Mascot</button>
                <button className={"toggle-btn" + (showImage ? " active" : "")} onClick={() => setShowImage(v => !v)}>Image</button>
                <button className={"toggle-btn" + (showStatement ? " active" : "")} onClick={() => setShowStatement(v => !v)}>Personal Statement</button>
                <button className={"toggle-btn" + (showBackgrounds ? " active" : "")} onClick={() => setShowBackgrounds(v => !v)}>Backgrounds</button>
                <button className={"toggle-btn" + (showClasses ? " active" : "")} onClick={() => setShowClasses(v => !v)}>Classes</button>
                <button className={"toggle-btn" + (showExtra ? " active" : "")} onClick={() => setShowExtra(v => !v)}>Extra Information</button>
                <button className={"toggle-btn" + (showQuote ? " active" : "")} onClick={() => setShowQuote(v => !v)}>Quote</button>
                <button className={"toggle-btn" + (showLinks ? " active" : "")} onClick={() => setShowLinks(v => !v)}>Links</button>
                {/* slideshow toggle */}
                <button
                    className={"toggle-btn slideshow-toggle" + (slideshowOn ? " active" : "")}
                    onClick={() => {
                        // turning slideshow off should reset the index; turning on will start at 0
                        setSlideshowOn(s => {
                            const next = !s;
                            if (!next) setSlideshowIndex(0);
                            return next;
                        });
                    }}
                >Slideshow</button>
            </div>
            {(() => {
                const q = (nameSearch || "").trim().toLowerCase();

                function matchesName(student, q) {
                    if (!q) return true; // empty query matches everything

                    // Gather potential name strings from common fields
                    const candidates = [];
                    try {
                        const full = getFullName(student);
                        if (full) candidates.push(full);
                    } catch (e) { /* ignore */ }

                    // name can be an object
                    if (student.name && typeof student.name === 'object') {
                        const n = student.name;
                        candidates.push(n.first ?? n.firstName ?? '');
                        candidates.push(n.last ?? n.lastName ?? '');
                        candidates.push(n.preferred ?? '');
                    }

                    // other common fields
                    candidates.push(student.firstName ?? '');
                    candidates.push(student.lastName ?? student.last ?? '');
                    candidates.push(student.prefix ?? '');

                    // join and attempt a substring check across the combined candidate strings
                    for (const c of candidates) {
                        if (!c) continue;
                        if (String(c).toLowerCase().includes(q)) return true;
                    }

                    return false;
                }

                const visible = introductions.filter(s => matchesName(s, q));

                if (q && visible.length === 0) {
                    return <div className="introductions-empty">No students match "{nameSearch}"</div>;
                }
                // when slideshow mode is on, only render the current visible index
                if (slideshowOn) {
                    // clamp slideshowIndex safely
                    const count = visible.length;
                    if (count === 0) return <div className="introductions-empty">No students to show in slideshow</div>;
                    const idx = ((slideshowIndex % count) + count) % count;
                    const s = visible[idx];

                    // render the single student card (we largely reuse the same card render below)
                    const student = s;
                    const i = idx;

                    // provide slideshow navigation controls above the card
                    return (
                        <div key={`slideshow-${student.id ?? i}`}>
                            <div className="slideshow-controls">
                                <button
                                    className="slideshow-btn"
                                    onClick={() => {
                                        setSlideshowIndex(prev => (prev - 1 + visible.length) % visible.length);
                                    }}
                                >Previous</button>
                                <span className="slideshow-indicator">{idx + 1} / {visible.length}</span>
                                <button
                                    className="slideshow-btn"
                                    onClick={() => {
                                        setSlideshowIndex(prev => (prev + 1) % visible.length);
                                    }}
                                >Next</button>
                            </div>
                            <article key={student.id ?? i} className="introduction-card">
                                {/* (content of card rendered below — to avoid duplicating code, we leverage the same rendering logic by falling-through and mapping one item) */}
                                {/* We'll render the card using the same logic as the normal map below by building the needed variables inline */}
                                {/* Determine name pieces — tolerate different schemas */}
                                {(() => {
                                    const fullName = getFullName(student) || `Student ${i + 1}`;

                                    // Image fallback logic (same as below)
                                    let imgSrc = "";
                                    if (student.media && student.media.src) {
                                        const src = student.media.src;
                                        if (src.startsWith('http')) imgSrc = src;
                                        else if (src.startsWith('/')) imgSrc = baseUrl ? `${baseUrl}${src}` : src;
                                        else if (/^(assets|media)\//.test(src)) imgSrc = baseUrl ? `${baseUrl}/${src}` : `/${src}`;
                                        else imgSrc = baseUrl ? `${baseUrl}/${src}` : `/${src}`;
                                    } else if (student.photo) {
                                        imgSrc = student.photo;
                                    }

                                    const imgAlt = (student.media && (student.media.caption || student.media.alt)) || student.photoAlt || `${fullName}`;

                                    const backgrounds = student.backgrounds ?? {};
                                    const primaryDevice = student.platform?.device ?? student.primaryComputer ?? student.primaryDevice;

                                    const quoteText = typeof student.quote === 'string' ? student.quote : student.quote?.text ?? student.favoriteQuote ?? student.quoteText;
                                    const quoteAuthor = student.quote?.author ?? student.quoteBy ?? student.quoteAuthor;

                                    const courses = getCoursesForStudent(student);
                                    // normalized funFact (support different field names)
                                    const funFact = student.funFact ?? student.funfact ?? student['fun_fact'] ?? student.additional ?? null;

                                    return (
                                        <>
                                            {(showName || showMascot) ? (
                                                <h3>
                                                    {showName ? fullName : null}
                                                    {(showName && showMascot && student.divider) ? <span className="divider-inline"> {student.divider} </span> : null}
                                                    {showMascot && student.mascot ? <span className="mascot"> {student.mascot}</span> : null}
                                                </h3>
                                            ) : null}

                                            {showImage && imgSrc && (student.media?.hasImage ?? true) ? (
                                                <figure>
                                                    <img width="534" height="534" src={imgSrc} onError={(e) => {
                                                        try {
                                                            const orig = student.media?.src || '';
                                                            if (!e.target._triedRemote) {
                                                                e.target._triedRemote = true;
                                                                if (!orig.startsWith('http')) {
                                                                    const origin = baseUrl ?? 'https://dvonb.xyz';
                                                                    const candidate = orig.startsWith('/') ? `${origin}${orig}` : `${origin}/${orig}`;
                                                                    e.target.src = candidate;
                                                                }
                                                            }
                                                        } catch (err) {}
                                                    }} alt={imgAlt} />

                                                    {(student.media?.caption || student.photoAlt || student.media?.alt) ? (
                                                        <figcaption className="image-caption">{student.media?.caption ?? student.photoAlt ?? student.media?.alt}</figcaption>
                                                    ) : null}
                                                </figure>
                                            ) : null}

                                            {showStatement && getStatement(student) ? (
                                                <p>
                                                    <strong>Personal Statement:</strong> {getStatement(student)}
                                                </p>
                                            ) : null}

                                            <ul>
                                                {showBackgrounds && backgrounds.personal ? (
                                                    <li>
                                                        <strong>Personal Background:</strong> {backgrounds.personal}
                                                    </li>
                                                ) : null}

                                                {showBackgrounds && (backgrounds.academic || student.academicBackground || student.academic) ? (
                                                    <li>
                                                        <strong>Academic Background:</strong> {backgrounds.academic ?? student.academicBackground ?? student.academic}
                                                    </li>
                                                ) : null}

                                                {showBackgrounds && (backgrounds.professional || student.professionalBackground || student.professional) ? (
                                                    <li>
                                                        <strong>Professional Background:</strong> {backgrounds.professional ?? student.professionalBackground ?? student.professional}
                                                    </li>
                                                ) : null}

                                                {showExtra && (primaryDevice) ? (
                                                    <li>
                                                        <strong>Primary Computer:</strong> {primaryDevice}
                                                    </li>
                                                ) : null}
                                                {/* Fun fact / extra information - show directly under primary computer */}
                                                {showExtra && funFact ? (
                                                    <li>
                                                        <strong>Fun Fact:</strong> {funFact}
                                                    </li>
                                                ) : null}
                                                {showClasses ? (
                                                <li>
                                                    <strong>Courses I’am Taking and Why</strong>
                                                    {Array.isArray(courses) && courses.length > 0 ? (
                                                        <ol>
                                                            {courses.map((course, idx) => (
                                                                <li key={idx}><strong>{typeof course === 'string' ? course : course.code ?? course.name ?? `Course ${idx+1}`}</strong>{typeof course === 'object' && (course.reason || course.description) ? ` : ${course.reason ?? course.description}` : ''}</li>
                                                            ))}
                                                        </ol>
                                                    ) : (
                                                        <div>No courses listed.</div>
                                                    )}
                                                </li>
                                                ) : null}

                                                {showQuote && quoteText ? (
                                                    <li>
                                                        <strong>Quote:</strong>
                                                        <div>
                                                            {quoteText}
                                                            {quoteAuthor ? (<p><em>- {quoteAuthor}</em></p>) : null}
                                                        </div>
                                                    </li>
                                                ) : null}

                                                {/* funFact already displayed earlier (under Primary Computer) */}

                                                {showLinks && student.links && typeof student.links === 'object' ? (
                                                    <li>
                                                        <strong>Links:</strong>{' '}
                                                        {Object.entries(student.links).map(([k, v], idx, arr) => (
                                                            <span key={k}><a href={v} target="_blank" rel="noreferrer">{k}</a>{idx < arr.length - 1 ? ' | ' : ''}</span>
                                                        ))}
                                                    </li>
                                                ) : null}
                                            </ul>
                                        </>
                                    );
                                })()}
                            </article>
                        </div>
                    );
                }

                return visible.map((student, i) => {
                // Determine name pieces — tolerate different schemas
                const fullName = getFullName(student) || `Student ${i + 1}`;
                // we prefer the full name in the heading

                // Image fallback logic
                let imgSrc = "";
                if (student.media && student.media.src) {
                    const src = student.media.src;
                    // If this JSON came from a remote source (baseUrl set), prefer baseUrl for root-relative paths.
                    if (src.startsWith('http')) {
                        imgSrc = src;
                    } else if (src.startsWith('/')) {
                        imgSrc = baseUrl ? `${baseUrl}${src}` : src;
                    } else if (/^(assets|media)\//.test(src)) {
                        // if we fetched remote data prefer the remote origin for assets/media
                        imgSrc = baseUrl ? `${baseUrl}/${src}` : `/${src}`;
                    } else {
                        // any other non-URL string — try remote origin if available otherwise local relative
                        imgSrc = baseUrl ? `${baseUrl}/${src}` : `/${src}`;
                    }
                } else if (student.photo) {
                    imgSrc = student.photo;
                }

                const imgAlt = (student.media && (student.media.caption || student.media.alt)) || student.photoAlt || `${fullName}`;

                // backgrounds and platform
                const backgrounds = student.backgrounds ?? {};
                const primaryDevice = student.platform?.device ?? student.primaryComputer ?? student.primaryDevice;

                // quote handling
                const quoteText = typeof student.quote === 'string' ? student.quote : student.quote?.text ?? student.favoriteQuote ?? student.quoteText;
                const quoteAuthor = student.quote?.author ?? student.quoteBy ?? student.quoteAuthor;

                // Courses — support multiple possible field names
                const courses = getCoursesForStudent(student);
                // normalized funFact (support different field names)
                const funFact = student.funFact ?? student.funfact ?? student['fun_fact'] ?? student.additional ?? null;

                return (
                    <article key={student.id ?? i} className="introduction-card">
                        {/* show heading if either name or mascot is enabled */}
                        {(showName || showMascot) ? (
                            <h3>
                                {showName ? fullName : null}
                                {/* inline divider shows only when both name and mascot are visible */}
                                {(showName && showMascot && student.divider) ? <span className="divider-inline"> {student.divider} </span> : null}
                                {showMascot && student.mascot ? <span className="mascot"> {student.mascot}</span> : null}
                            </h3>
                        ) : null}

                        {showImage && imgSrc && (student.media?.hasImage ?? true) ? (
                            <figure>
                                <img
                                    width="534"
                                    height="534"
                                    src={imgSrc}
                                    onError={(e) => {
                                    // if the image fails to load and it's a root-relative path, try the remote host fallback
                                    try {
                                        const orig = student.media?.src || '';
                                        if (!e.target._triedRemote) {
                                            e.target._triedRemote = true;
                                            if (!orig.startsWith('http')) {
                                                // create candidate URL using known remote origin or dvonb.xyz
                                                const origin = baseUrl ?? 'https://dvonb.xyz';
                                                const candidate = orig.startsWith('/') ? `${origin}${orig}` : `${origin}/${orig}`;
                                                e.target.src = candidate;
                                            }
                                        }
                                    } catch (err) {
                                        // swallow
                                    }
                                }}
                                    alt={imgAlt}
                                />
                                {/* caption (if available) — prefer media.caption then alt text */}
                                {(student.media?.caption || student.photoAlt || student.media?.alt) ? (
                                    <figcaption className="image-caption">{student.media?.caption ?? student.photoAlt ?? student.media?.alt}</figcaption>
                                ) : null}
                            </figure>
                        ) : null}

                        {/* Personal Statement (try both spellings) */}
                        {showStatement && getStatement(student) ? (
                            <p>
                                <strong>Personal Statement:</strong> {getStatement(student)}
                            </p>
                        ) : null}

                            <ul>
                            {/* optional background fields */}
                            {showBackgrounds && backgrounds.personal ? (
                                <li>
                                    <strong>Personal Background:</strong> {backgrounds.personal}
                                </li>
                            ) : null}

                            {showBackgrounds && (backgrounds.academic || student.academicBackground || student.academic) ? (
                                <li>
                                    <strong>Academic Background:</strong> {backgrounds.academic ?? student.academicBackground ?? student.academic}
                                </li>
                            ) : null}

                            {showBackgrounds && (backgrounds.professional || student.professionalBackground || student.professional) ? (
                                <li>
                                    <strong>Professional Background:</strong> {backgrounds.professional ?? student.professionalBackground ?? student.professional}
                                </li>
                            ) : null}

                            {showExtra && (primaryDevice) ? (
                                <li>
                                    <strong>Primary Computer:</strong> {primaryDevice}
                                </li>
                            ) : null}

                            {showExtra && funFact ? (
                                <li>
                                    <strong>Fun Fact:</strong> {funFact}
                                </li>
                            ) : null}

                            {showClasses ? (
                            <li>
                                <strong>Courses I’am Taking and Why</strong>
                                {Array.isArray(courses) && courses.length > 0 ? (
                                    <ol>
                                        {courses.map((course, idx) => (
                                            <li key={idx}>
                                                <strong>{typeof course === 'string' ? course : course.code ?? course.name ?? `Course ${idx+1}`}</strong>
                                                {typeof course === 'object' && (course.reason || course.description) ? ` : ${course.reason ?? course.description}` : ''}
                                            </li>
                                        ))}
                                    </ol>
                                ) : (
                                    <div>No courses listed.</div>
                                )}
                            </li>
                            ) : null}

                            {showQuote && quoteText ? (
                                <li>
                                    <strong>Quote:</strong>
                                    <div>
                                        {quoteText}
                                        {quoteAuthor ? (
                                            <p>
                                                <em>- {quoteAuthor}</em>
                                            </p>
                                        ) : null}
                                    </div>
                                </li>
                            ) : null}

                            {/* funFact moved above (displayed under Primary Computer) */}

                            {/* optional links */}
                            {showLinks && student.links && typeof student.links === 'object' ? (
                                <li>
                                    <strong>Links:</strong>{' '}
                                    {Object.entries(student.links).map(([k, v], idx, arr) => (
                                        <span key={k}>
                                            <a href={v} target="_blank" rel="noreferrer">{k}</a>{idx < arr.length - 1 ? ' | ' : ''}
                                        </span>
                                    ))}
                                </li>
                            ) : null}
                        </ul>

                        {/* show divider only when both name and mascot are visible */}
                        {(showName && showMascot) ? <div className="divider" /> : null}
                    </article>
                );
                });
            })()}
        </main>
    );
}