import {
    ChangeDetectionStrategy,
    Component,
    forwardRef,
    inject,
    input
} from "@angular/core";
import {
    CLASSES,
    KC_CONTEXT,
    USE_DEFAULT_CSS
} from "@keycloakify/angular/lib/providers/keycloakify-angular.providers";
import { ClassKey } from "keycloakify/login/lib/kcClsx";
import { KcContext } from "keycloakify/login/KcContext";
import { ComponentReference } from "@keycloakify/angular/login/classes/component-reference.class";
import { TemplateComponent } from "@keycloakify/angular/login/containers/template.component";
import { AdvancedMsgStrPipe } from "@keycloakify/angular/login/pipes/advanced-msg-str.pipe";
import { KcSanitizePipe } from "@keycloakify/angular/login/pipes/kc-sanitize.pipe";
import { MsgStrPipe } from "@keycloakify/angular/login/pipes/msg-str.pipe";

@Component({
    standalone: true,
    imports: [TemplateComponent, MsgStrPipe, KcSanitizePipe, AdvancedMsgStrPipe],
    selector: "kc-root",
    templateUrl: "info.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        AdvancedMsgStrPipe,
        MsgStrPipe,
        KcSanitizePipe,
        {
            provide: ComponentReference,
            useExisting: forwardRef(() => InfoComponent)
        }
    ]
})
export class InfoComponent extends ComponentReference {
    kcContext = inject<Extract<KcContext, { pageId: "info.ftl" }>>(KC_CONTEXT);
    advancedMsgStr = inject(AdvancedMsgStrPipe);
    kcSanitize = inject(KcSanitizePipe);
    msgStr = inject(MsgStrPipe);
    override doUseDefaultCss = inject<boolean>(USE_DEFAULT_CSS);
    override classes = inject<Partial<Record<ClassKey, string>>>(CLASSES);
    displayRequiredFields = input(false);
    documentTitle = input<string>();
    bodyClassName = input<string>();
    displayInfo: boolean = false;
    displayMessage: boolean = false;

    get infoMessage() {
        let html = this.kcContext.message.summary;
        if (this.kcContext.requiredActions) {
            html += "<b>";

            html += this.kcContext.requiredActions
                .map(requiredAction =>
                    this.advancedMsgStr.transform(`requiredAction.${requiredAction}`)
                )
                .join(", ");

            html += "</b>";
        }
        return html;
    }
}
