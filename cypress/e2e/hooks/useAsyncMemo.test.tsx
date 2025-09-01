import useAsyncMemo from "hooks/utility/useAsyncMemo"
import { useEffect, useState } from "react"

it("Should not allow the latest version of dep array be overwritten by old async process", () => {
    const Cenario = () => {
        const [dep, setDep] = useState(0)
        const [postDep] = useAsyncMemo(async () => {
            await new Promise<void>(r => setTimeout(() => {
                r()
                /**The first (old) async process will take longer, so it's result will override new setup */
            }, dep === 0 ? 1000 : 200))
            return dep;
        }, [dep])

        useEffect(() => {
            /** This will trigger next async process */
            setDep(o => o + 1);
        }, [])

        return <>
            <h1>DEP: {dep}</h1>
            <h1>ASYNC: {postDep}</h1>
        </>
    }
    cy.mount(<Cenario />)
    cy.wait(2000)
    cy.contains("ASYNC: 1")
})