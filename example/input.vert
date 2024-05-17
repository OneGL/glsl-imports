import input2 from "./input2.glsl";
import input3 from "./folder/input3.glsl"; // This import is not used
import input4 from "./otro/input4.glsl";

void main() {
    input2.add2();
    input4.add4();
    float a = input2.add2();

    input3.add3(1, 1);
    return 0;
}
