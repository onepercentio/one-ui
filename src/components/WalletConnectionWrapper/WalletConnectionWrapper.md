:::mermaid
graph LR
    classDef TEST_CENARIO fill:green

    IFA[PROVIDER AVAILABLE]
    IFA --> CA[DOESN'T HAVE PROVIDER]
    IFA -->|User connects| IFB[Connect success]
    IFB -->|NO|CB[Connect fails]
    IFB -->|YES|IFC[Chain ID correct]
    IFC -->|NO|CC[Warn chain id invalid<br>and asks to change]
    IFC -->|YES|CD[User can continue flow]

    class CA,CB,CC,CD TEST_CENARIO
:::