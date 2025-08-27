import { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import ModalComponent from '../components/ModalComponent'
import { setMessageState } from '../utils/UIUtils'
import { Constants } from '../utils/Constants';
import { list, upload } from '../services/Request'

const CV = () => {

    const [jobs, setJobs] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedJob, setSelectedJob] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [actionEvent, setActionEvent] = useState('');
    const [message, setMessage] = useState({
        label: '',
        variant: ''
    })

    const uploadFile = () => {
        setActionEvent(Constants.MODAL_LABEL_UPLOAD)
        setShowModal(true);
        upload(selectedFile, selectedJob)
            .then((response) => {
                setMessage(() => setMessageState(response, Constants.ALERT_SUCCESS));
            }).catch((error) => {
                setMessage(() => setMessageState(error, Constants.ALERT_DANGER));
            }).finally(() => {
                setShowModal(false);
            });
    };

    const loadJobs = () => {
        setActionEvent(Constants.MODAL_LABEL_LIST)
        setShowModal(true);
        list()
            .then(result => {
                setJobs(JSON.parse(result));
            }).catch((error) => {
                setMessage(() => setMessageState(error, 'danger'));
            }).finally(() => {
                setShowModal(false);
            });
    }

    useEffect(() => {
        loadJobs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <Alert variant={message.variant} hidden={message.label === ''}>{message.label}</Alert>
            <Form.Group className="mb-3">
                <Form.Control type="file" accept=".pdf" onChange={(event) => {
                    setMessage(() => setMessageState('', ''));
                    const file = event.target.files[0];
                    const maxSize = 2 * 1024 * 1024;
                    if (file.size > maxSize) {
                        setMessage(() => setMessageState(Constants.MSG_FILE_EXCEEDS, Constants.ALERT_WARNING));
                    } else {
                        setSelectedFile(file);
                    }
                }} />

                <br />

                <Form.Select onChange={(event) => {
                    const job = event.target.value;
                    if (job !== "") {
                        setSelectedJob(job)
                    } else {
                        setSelectedJob(null)
                    }
                }}>
                    <option value="">Select Job</option>
                    {
                        jobs.map((job, index) => (
                            <option value={job.Name} key={index}>{job.Name}</option>
                        ))
                    }
                </Form.Select>

                <br />

                <Button className="button" variant="primary" disabled={!(selectedFile && selectedJob)} onClick={uploadFile}>{Constants.UPLOAD}</Button>
            </Form.Group>
            <ModalComponent showModal={showModal} label={actionEvent} />
        </>
    )
}

export default CV