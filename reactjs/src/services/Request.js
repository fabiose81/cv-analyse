const apiUrl = "http://localhost:5000"

export function create(title, criteria) {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");   

    const requestOptions = {
        method: 'POST',
        body: JSON.stringify({
            "title": title,
            "criteria": criteria
        }),
        headers: myHeaders
    };

    return request('/job', requestOptions);
}

export function list() {
    const requestOptions = {
        method: 'GET'
    };

    return request('/jobs', requestOptions);
}

export function upload(file, job) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('data', JSON.stringify({ "bucket": job }));

    const requestOptions = {
        method: 'POST',
        body: formData
    };

    return request('/upload', requestOptions);
}

const request = (path, requestOptions) => {
    return new Promise((resolve, reject) => {
        fetch(apiUrl.concat(path), requestOptions)
            .then((response) => {
                if (response.status === 200 || response.status === 201) {
                    return response.text()
                } else if (response.status === 500) {
                    //to-do
                    reject('Internal Error')
                } else {
                    reject(response.text())
                }
            })
            .then((result) => {
                resolve(result)
            })
            .catch((error) =>
                reject(error.message));
    });
}