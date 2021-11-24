# FlowController

## Description

Container for a flow, managing the go back and close controller

## Business rules

- Should call onClose when clicking goBack and step 0
- Should call onGoBack when clicking the goBack button and step > 0
- Should call onNext when clicking the footer button
- Should display the selected text on the button
- Should be able to enable point of no return, where the goBack action is not displayed anymore
