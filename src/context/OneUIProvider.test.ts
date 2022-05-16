import { ProtectVariableAccess } from "./OneUIProvider";

const loggingSpy = jest.spyOn(console, "error");

loggingSpy.mockImplementation(() => {});

describe("The proxy that protects variable access", () => {
  it("Should work when there is no object (the provider is not added yet)", () => {
    ProtectVariableAccess();
  });
  it("Should work when there is a concatenation", () => {
    const val = ProtectVariableAccess(() => {});
    expect("" + val).toBeDefined();
  });
  it("Should work when there is an or", () => {
    const val = ProtectVariableAccess(() => {});
    expect(val || "expectedResult").toEqual("expectedResult");
  });
  it("Should log expected value", () => {
    const a = ProtectVariableAccess({ some: { prop: "string" } });
    // expect("Result: " + a).toEqual("Result: [object Object]");
    expect("Result: " + a.some.prop).toEqual("Result: string");
  });
  it("Should display the path to the file when it doesn't exists", () => {
    const protectedObject = ProtectVariableAccess({});
    protectedObject.undefinedProperty;
    expect(loggingSpy).toHaveBeenCalledWith(
      expect.stringContaining("undefinedProperty")
    );

    jest.clearAllMocks();
    const protectedObjectWithSecondLevelDependency = ProtectVariableAccess({
      undefinedProperty: {},
    });
    protectedObjectWithSecondLevelDependency.undefinedProperty
      .thisShouldNotCrash;
    expect(loggingSpy).toHaveBeenCalledWith(
      expect.stringContaining("undefinedProperty.thisShouldNotCrash")
    );

    jest.clearAllMocks();
    const protectedObjectWithThirddLevelDependency = ProtectVariableAccess({
      undefinedProperty: {
        thisShouldNotCrash: {},
      },
    });
    protectedObjectWithThirddLevelDependency.undefinedProperty
      .thisShouldNotCrash.andThisShouldFollowAllThePath;
    expect(loggingSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        "undefinedProperty.thisShouldNotCrash.andThisShouldFollowAllThePath"
      )
    );
  });
});
