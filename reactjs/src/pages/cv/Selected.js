import { useState, useEffect } from 'react';
import Alert from 'react-bootstrap/Alert';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Image from 'react-bootstrap/Image';
import ListGroup from 'react-bootstrap/ListGroup';
import ModalComponent from '../../components/ModalComponent'
import { setMessageState } from '../../utils/UIUtils'
import { Constants } from '../../utils/Constants';
import { listJobs, listCVs, getCV } from '../../services/Request'

const Selected = () => {

    const [jobs, setJobs] = useState([]);
    const [jobSelected, setJobSelected] = useState('');
    const [cvs, setCVs] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [modalComments, setModalComments] = useState(false);
    const [labelModal, setLabelModal] = useState('');
    const [message, setMessage] = useState({
        label: '',
        variant: ''
    })

    const loadJobs = () => {
        setLabelModal(Constants.MODAL_LABEL_JOB_LIST)
        setShowModal(true);
        listJobs()
            .then(result => {
                setJobs(JSON.parse(result));
            }).catch((error) => {
                setMessage(() => setMessageState(error, 'danger'));
            }).finally(() => {
                setShowModal(false);
            });
    }

    //to-do refactory (make reauseble function)
    const loadCVs = (job) => {
        setLabelModal(Constants.MODAL_LABEL_CV_LIST)
        setShowModal(true);
        listCVs(job)
            .then(result => {
                setCVs(JSON.parse(result));
            }).catch((error) => {
                setMessage(() => setMessageState(error, 'danger'));
            }).finally(() => {
                setShowModal(false);
            });
    }

    const downloadCV = (event) => {
        const key = event.target.id
        setLabelModal(Constants.MODAL_LABEL_JOB_LIST)
        setShowModal(true);
        getCV(jobSelected, key)
            .then(result => {
                window.open(result, '_blank', 'noopener,noreferrer');
            }).catch((error) => {
                setMessage(() => setMessageState(error, 'danger'));
            }).finally(() => {
                setShowModal(false);
            });
    }

    const showComments = (event) => {
        const comments = event.target.id
        setLabelModal(comments)
        setShowModal(true);
        setModalComments(true);
    }

    const closeModal = () => {
        setLabelModal('');
        setModalComments(false);
        setShowModal(false);
    }

    useEffect(() => {
        loadJobs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <Alert variant={message.variant} hidden={message.label === ''}>{message.label}</Alert>
            <Form.Group className="mb-3">
                <Form.Select onChange={(event) => {
                    const job = event.target.value;
                    setJobSelected(job);
                    if (job !== "") {
                        loadCVs(job);
                    } else {
                        setCVs([]);
                    }
                }}>
                    <option value="">Select Job</option>
                    {
                        jobs.map((job, index) => (
                            <option value={job.Name} key={index}>{job.Name}</option>
                        ))
                    }
                </Form.Select>
            </Form.Group>
            <ListGroup as="ol">
                {
                    cvs.map((cv, index) => (
                        <ListGroup.Item
                            as="li"
                            className="d-flex justify-content-between align-items-start"
                            key={index}>
                            <div className="ms-2 me-auto">
                                <div className="fw">{cv.key}</div>
                                score: {cv.score}
                            </div>
                            <div>
                                <Button onClick={downloadCV} id={cv.key} style={{ backgroundColor: "transparent", border: "none" }}>
                                    <Image onClick={downloadCV} src="download.svg" id={cv.key} style={{ width: "30px", height: "30px" }}></Image>
                                </Button>
                            </div>
                            <div>
                                <Button onClick={showComments} id={cv.comments} style={{ backgroundColor: "transparent", border: "none" }}>
                                     <Image src="comments.svg" id={cv.comments} style={{ width: "33px", height: "33px" }}></Image>
                                </Button>
                            </div>
                        </ListGroup.Item>
                    ))
                }
            </ListGroup>
            <ModalComponent showModal={showModal} label={labelModal} comments={modalComments} closeModal={closeModal}/>
        </>
    )
}

export default Selected;