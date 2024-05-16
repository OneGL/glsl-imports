import input2 from "./input2.glsl";
import input3 from "./folder/input3.glsl"; // This import is not used
import input4 from "./otro/input4.glsl";

int main() {
    input2.add2();
    input4.add4();
    vec3 v = input3.getVec3();
    return 0;
}
