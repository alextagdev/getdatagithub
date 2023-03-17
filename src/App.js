import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [username, setUsername] = useState('');
  const [user, setUser] = useState(null);
  const [gists, setGists] = useState([]);
  const [setSelectedGist] = useState(null);


function getLanguageColor(language) {
  const colors = {
	go: 'bg-red-500',
    swift: 'bg-green-500',
	shell: 'bg-yellow-500',
	markdown: 'bg-pink-500', 	
    javascript: 'bg-yellow-500',
    python: 'bg-blue-500',
    java: 'bg-red-500',
    ruby: 'bg-pink-500',
	php: 'bg-pink-500',
    html: 'bg-red-600',
    css: 'bg-blue-600',
    'c#': 'bg-purple-500',
    'c++': 'bg-green-500',
    'objective-c': 'bg-gray-500',
    unknown: 'bg-gray-500',
  };
  return colors[language.toLowerCase()] || colors.unknown;
}


  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handleGistClick = (gist) => {
    setSelectedGist(gist);
  };
  
  const [setSelectedFork] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`https://api.github.com/users/${username}`, {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_GITHUB_TOKEN}`
          }
        });
        setUser(response.data);
      } catch (error) {
        console.log(error);
      }
    };
  
    const fetchGists = async () => {
      try {
        const response = await axios.get(`https://api.github.com/users/${username}/gists`, {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_GITHUB_TOKEN}`
          }
        });
  
        const gistsWithForks = await Promise.all(
          response.data.map(async (gist) => {
            const forksResponse = await axios.get(gist.forks_url, {
              headers: {
                Authorization: `Bearer ${process.env.REACT_APP_GITHUB_TOKEN}`
              }
            });
  
            const forks = await Promise.all(
              forksResponse.data.map(async (fork) => {
                const ownerResponse = await axios.get(fork.owner.url, {
                  headers: {
                    Authorization: `Bearer ${process.env.REACT_APP_GITHUB_TOKEN}`
                  }
                });
                const owner = ownerResponse.data;
                return { username: owner.login, avatar_url: owner.avatar_url };
              })
            );
  
            const files = Object.values(gist.files);
            const language = files.length > 0 ? files[0].language : null;
  
            return { ...gist, forks, language };
          })
        );
  
        setGists(gistsWithForks);
      } catch (error) {
        console.log(error);
      }
    };
  
    if (username) {
      const fetchData = async () => {
        await fetchUser();
        await fetchGists();
      };
  
      fetchData();
    }
  }, [username]);
  


  return (
    <div className="pt-4 pb-6 max-w-screen-md mx-auto">
      <label className="flex flex-col items-start gap-y-2 md:flex-row md:items-center ">
        <h3 className="text-lg font-medium md:mr-2">GitHub username:</h3>
        <input
          type="text"
		  placeholder="Search for a user"
          value={username}
          onChange={handleUsernameChange}
          className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500 border rounded-md  md:w-auto" 
        />
        <button type="submit" className="p-2.5 ml-2 text-sm font-medium text-white bg-blue-700 rounded-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <span className="sr-only">Search</span>
        </button>
      </label>
      {user && (
        <div className="mt-4 flex items-center gap-4">
          <img
            src={user.avatar_url}
            alt={user.login}
            className="rounded-full w-16 h-16 flex-shrink-0"
          />
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-gray-600">{user.bio}</p>
          </div>
        </div>
      )}
      <ul className="border rounded-lg divide-y divide-gray-200">
        {gists.map((gist) => (
		<li key={gist.id} className="p-4 hover:bg-gray-50 flex items-center" onClick={() => handleGistClick(gist)}>
			<img
			  src={gist.owner.avatar_url}
			  alt={gist.owner.login}
			  className="rounded-full mr-4 w-10 h-10"
			/>
			<div>
			  <a href={gist.html_url} className="text-blue-500 hover:text-blue-700">
				{gist.description}
			  </a>
			  <div className="text-sm text-gray-500">Created: {new Date(gist.created_at).toLocaleDateString()}</div>
			 <div className="text-sm text-gray-500">
  Language:{' '}
  {Object.values(gist.files)[0].language ? (
    <span className={`inline-block px-2 py-1 text-white font-bold rounded ${getLanguageColor(Object.values(gist.files)[0].language)}`}>
      {Object.values(gist.files)[0].language}
    </span>
  ) : (
    <span className="inline-block px-2 py-1 text-white font-bold rounded bg-gray-500">
      Unknown
    </span>
  )}
</div>

{gist.forks.length > 0 && (
  <div className="text-sm text-gray-500 mt-4">
    <div className="grid grid-cols-4 auto-cols-max gap-2">
      Forked by:{' '}
      {gist.forks.map((fork) => (
        <span key={fork.username} onClick={() => setSelectedFork(fork)}>
          <img
            src={fork.avatar_url}
            alt={fork.username}
            className="rounded-full mr-1 w-6 h-6 cursor-pointer"
          />
          {fork.username}
        </span>
      ))}
    </div>
  </div>
)}
			</div>
		  </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
