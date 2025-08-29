import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import './ModalComponent.css'

const ModalComponent = (props) => {

    const showModal = props.showModal;
    const label = props.label;
    const comments = props.comments;
    const closeModal = props.closeModal;

    return (
        comments ?
            <div data-testid="modal">
                <Modal show={showModal} centered>
                    <Modal.Header>
                        <Modal.Title>Comments</Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{ height: "400px", overflowY: "auto" }}>
                        <div className="center">
                            <span>{label}</span>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={closeModal}>
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div> :
            <div data-testid="modal">
                <Modal show={showModal} centered>
                    <Modal.Body style={{ height: "205px" }}>
                        <div style={{ height: "175px", }} className="center">
                            <span className="loader">{label}</span>
                        </div>
                    </Modal.Body>
                </Modal>
            </div>

    );
}

export default ModalComponent;